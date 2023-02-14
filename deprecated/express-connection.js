const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const switcher = require("./dyno-switcher");

app.get("/mengtukar", (req, res) => {
  switcher.turnSelfOn();
  res.send("Tertukar!");
});

app.get("/*", (req, res) => {
  res.send("Running!");
});

function connect() {
  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
}
module.exports = {
  connect,
};
