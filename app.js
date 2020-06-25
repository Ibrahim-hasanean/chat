const app = require("express")();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("socket suppose to be connected");
});

let ns = io.of("/chat");

ns.on("connection", (socket) => {
  console.log("user connected");
  socket.on("send_message", (data) => {
    socket.emit("recive_message", data);
  });
});

http.listen(port, () => {
  console.log("app lsten on port");
});
