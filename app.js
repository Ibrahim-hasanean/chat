const app = require("express")();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const io = require("socket.io")(http);
const User = require("./model/User");
const Chat = require("./model/chat");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("./config/mongoose");
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("socket suppose to be connected  ");
});
//let users = [];
app.post("/signup", async (req, res) => {
  try {
    let { userName, password } = req.body;
    let isExist = await User.findOne({ name: userName });
    if (isExist) {
      return res
        .status(400)
        .json({ status: 400, msg: "user laready signed up" });
    }
    password = bcrypt.hashSync(String(password), 10);
    let newUser = await User.create({ name: userName, password });
    res.status(200).json({ userName: newUser.name, _id: newUser._id });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, msg: "smth wrong" });
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
    res.status(200).json({ userName: userExist.name, _id: userExist._id });
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
    res.status(200).send({ status: 200, msg: "password reset successfully" });
  } catch (e) {
    console.log(e);
    res.send("smth wrong");
  }
});
let users = [];
io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("user_connect", (data) => {
    let { userName, userId } = data;
    if (userName && userId) {
      socket.broadcast("user_join", data);
    }
  });
  socket.emit("info", "connected to server");
  socket.on("send_message", (data) => {
    console.log(data);
    io.sockets.emit("recive_message", data);
  });
  socket.on("join_room", (data) => {
    let { roomId } = data;
    socket.join(`${roomId}`);
  });

  socket.on("disconnect", () => {
    io.sockets.emit("user_discoonect", {
      id: socket.userId,
      name: socket.userName,
    });
    console.log("user disconnect");
  });
});

// let ns = io.of("/chat");

// ns.on("connection", (socket) => {
//   console.log("user connected");
//   socket.on("user_connect", (data) => {
//     let { userName } = data;
//     socket.broadcast("user_join", data);
//   });
//   socket.emit("info", "connected to server");
//   socket.on("send_message", (data) => {
//     console.log(data);
//     io.of("/chat").emit("recive_message", data);
//   });
//   socket.on("join_room", (data) => {
//     let { roomId } = data;
//     socket.join(`${roomId}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("user disconnect");
//   });
// });

http.listen(port, () => {
  console.log("app lsten on port");
});
