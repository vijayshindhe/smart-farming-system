const express = require("express");
const app = express();

app.use((req, res, next) => {
  console.log("GOT REQ", req.url);
  next();
});
app.get("/", (req, res) => res.send("hello"));
app.listen(3001, () => console.log("Test server running on 3001"));
