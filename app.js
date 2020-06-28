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

//let ns = io.of("/chat");

io.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("info", "connected to server");
  socket.on("send_message", (data) => {
    console.log(data);
    //io.of("chat").emit("recive_message", "ibrahim");
    //socket.emit("recive_message", "ibrahim");
    io.sockets.emit("recive_message", { data });
  });
});

http.listen(port, () => {
  console.log("app lsten on port");
});
