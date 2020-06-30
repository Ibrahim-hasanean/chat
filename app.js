const app = require("express")();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const io = require("socket.io")(http);
const cors = require("cors");
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("socket suppose to be connected on /chat ");
});
let users = [];
app.post("/login", (req, res) => {
  console.log(users);
  let isExist = users.filter((user) => user == req.body.userName);
  console.log(isExist);
  if (isExist.length > 0) {
    return res.status(400).json({ status: 400, msg: "user Exist" });
  }
  users.push(req.body.userName);
  res.status(200).json({ status: 200, msg: "login success" });
});
//let ns = io.of("/chat");
app.post("/logout", (req, res) => {
  console.log(users.length);
  let isExist = users.filter((user) => user != req.body.userName);
  console.log(isExist.length);
  if (isExist.length == users.length) {
    return res.status(400).json({ status: 400, msg: "user did not login" });
  }
  users = [...isExist];
  res.status(200).json({ status: 200, msg: "logout success" });
});

io.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("info", "connected to server");
  socket.on("send_message", (data) => {
    console.log(data);
    //io.of("chat").emit("recive_message", "ibrahim");
    //socket.emit("recive_message", "ibrahim");
    io.sockets.emit("recive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnect");
  });
});

http.listen(port, () => {
  console.log("app lsten on port");
});
