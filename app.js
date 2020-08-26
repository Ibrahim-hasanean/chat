const app = require("express")();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const io = require("socket.io")(http);
const User = require("./model/User");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Conversation = require("./model/conversation");
const { config } = require("process");
const multer = require("multer");
const authurize = require("./middleware/authurize")
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./image/");
  },
  filename: function (req, file, cb) {
      
    cb(null, `${req.userId}.png`);
  },
});
let upload = multer({
  storage,
  fileFilter:(req,file,cb)=>{
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    }else{
      cb(null, false);
      return cb('Only .png, .jpg and .jpeg format allowed!');
    }
  },
  dest: "image",
  limits: { fileSize: 1000000000 },
});
require("./config/mongoose");
require('dotenv').config();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("socket suppose to be connected");
});
//let users = [];
app.post("/signup", async (req, res) => {
  try {
    let { userName, password } = req.body;
    let id;
    let isExist = await User.findOne({ name: userName });
    if (isExist) {
      return res
        .status(400)
        .json({ status: 400, msg: "user laready signed up" });
    }
    password = bcrypt.hashSync(String(password), 10);
    let users = await User.find({});
    if (users.length == 0) {
      id = 111;
    } else {
      id = users[users.length - 1].id + 1;
    }

    let newUser = await User.create({ name: userName, password, id });
    
    let token = jwt.sign({userId:newUser._id},process.env.JWT_SECRET,{expiresIn:'12h'})
    res.status(200).json({ userName: newUser.name, _id: newUser.id , token });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, msg: "smth wrong", token });
  }
});
app.post("/login", async (req, res) => {
  try {
    let { userName, password } = req.body;
    let userExist = await User.findOne({ name: userName });
    if (!userExist)
      return res.status(400).json({ status: 400, msg: "you should sign up" });
    let comparePassword = bcrypt.compareSync(
      String(password),
      userExist.password
    );
    console.log(userExist);
    if (!comparePassword) {
      return res.status(400).json({ status: 400, msg: "password wrong" });
    }
    let token = jwt.sign({userId:userExist._id},process.env.JWT_SECRET,{expiresIn:'12h'})
    res.status(200).json({ userName: userExist.name, _id: userExist.id , token });
  } catch (e) {
    console.log(e);
    res.send("smth wrong");
  }
});
app.get("/messages", async (req, res) => {
  try {
    let { from, to } = req.body;
    let chat = await Chat.find({ from, to });
    res.send(chat);
  } catch (e) {
    console.log(e);
    res.send("smth wrong");
  }
});
app.get("/getUsers", async (req, res, next) => {
  let allUsers = await User.find();
  res.json(allUsers);
});
app.post("/resetpassword", async (req, res) => {
  try {
    let { userName, password } = req.body;
    password = await bcrypt.hashSync(String(password), 10);
    console.log(password);
    let updatedUser = await User.findOneAndUpdate(
      { name: userName },
      { password: password }
    );
    res.status(200).send({ name: updatedUser.name, _id: updatedUser._id });
  } catch (e) {
    console.log(e);
    res.send("smth wrong");
  }
});

app.post("/uploadphoto",authurize,upload.single("photo"), (req, res) => {
  try {
    res.status(200).send(req.file);
  } catch (e) {
    res.send(400);
  }
});
app.get("/getphoto", authurize,(req, res) => {
    res.sendFile( __dirname + `/image/${req.userId}.png`);
});

app.use((err,req,res,next)=>{
  console.log(err);
  return res.status(400).json({status:400,msg:err})
})
io.sockets.users = [];
io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("user_connect", (data) => {
    let { userName, _id } = data;
    if (userName && _id) {
      socket.userName = userName;
      socket.userId = _id;
      let users = io.sockets.users.filter((x) => x.userName == userName);
      console.log("user_connect", userName);
      if (!users.length > 0) {
        io.sockets.users.push({ userName, _id, socketId: socket.id });
        io.sockets.emit("active_users", io.sockets.users);
        console.log("active users", io.sockets.users);
      }
    }
  });
  socket.emit("info", "connected to server");
  socket.on("send_message", async (data) => {
    try {
      let { senderName, msg, hour, minutes, reciverName, roomId } = data.msg;
      //await Conversation.create({ from: senderName, msg, hour, minutes });
      console.log(data);
      io.sockets.emit("recive_message", data);
      console.log(socket.room);
      socket.in(socket.room).emit("recive_message", {
        senderName,
        msg,
        hour,
        minutes,
        reciverName,
        roomId,
      });
      socket.emit("recive_message", {
        senderName,
        msg,
        hour,
        minutes,
        reciverName,
        roomId,
      });
      console.log(msg);
    } catch (e) {
      console.log("smth wrong", e);
    }
  });
  socket.on("join_room", (data) => {
    let { roomId } = data;
    socket.room = roomId;
    socket.join(roomId);
    console.log(`user ${socket.userName} joined the room ${roomId}`);
  });

  socket.on("leave_room", ({ room }) => {
    socket.leave(room, () => {
      //io.to('room').emit('')
      console.log(`user ${socket.userName} leaving the room`);
    });
  });
  socket.on("disconnect", () => {
    io.sockets.users = io.sockets.users.filter(
      (user) => user.userName != socket.userName
    );
    console.log(io.sockets.users);
    io.sockets.emit("active_users", io.sockets.users);
    console.log(`user ${socket.userName} disconnect`);
  });
});

http.listen(port, () => {
  console.log("app lsten on port 3000");
});
