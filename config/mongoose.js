const mongoose = require("mongoose");
//ibrahim197
mongoose.connect(
  "mongodb+srv://ibrahim:ibrahim197@cluster0.m4lmp.mongodb.net/<dbname>?retryWrites=true&w=majority",
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    console.log("mongoose connected");
  }
);
