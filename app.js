const app = require("express")();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const io = require("socket.io")(http);
const User = require("./model/User");
const Chat = require('./model/chat')
const bcrypt = require("bcrypt");
const cors = require("cors");
require("./config/mongoose");
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("socket suppose to be connected on /chat ");
});
//let users = [];
app.post("/signup", async (req, res) => {
  try {
    let { userName, password, colorId } = req.body;
    colorId = JSON.stringify(colorId);
    let isExist = await User.findOne({ name: userName });
    console.log(isExist);
    if (isExist) {
      return res
        .status(400)
        .json({ status: 400, msg: "user laready signed up" });
    }
    password = await bcrypt.hash(String(password), 10);
    let newUser = await User.create({ name: userName, password, colorId });
    console.log(newUser);
    res.status(200).json({ status: 200, msg: " signup success" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, msg: "smth wrong" });
  }
});
app.post("/login", async (req, res) => {
  let { userName, password } = req.body;
  let userExist = await User.findOne({ name: userName });
  if (!userExist)
    return res.status(400).json({ status: 400, msg: "you should sign up" });
  let comparePassword = await bcrypt.compare(
    String(password),
    userExist.password
  );
  console.log(comparePassword);
  if (!comparePassword) {
    return res.status(400).json({ status: 400, msg: "password wrong" });
  }
  res.status(200).json({ status: 200, msg: " login success" });
});
app.get('/messages',(req,res)=>{
  try{
  let{from,to} = req.body;
  let chat = await Chat.find({from,to});
  res.send(chat);
  }catch(e){
    console.log(e);
    res.send('smth wrong')
  }
})
io.on("connection", (socket) => {
  console.log("user connected");
  socket.on('user_connect',(data)=>{
    let {userName} = data;
    socket.broadcast('user_join',data);
  })
  socket.emit("info", "connected to server");
  socket.on("send_message", (data) => {
    console.log(data);
    io.sockets.emit("recive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnect");
  });
});

http.listen(port, () => {
  console.log("app lsten on port");
});
