const axios = require("axios").default;
const auth1 = process.env.AUTH1;
const auth2 = process.env.AUTH2;

function turnSelfOn() {
  setTimeout(() => {
    axios({
      method: "PATCH",
      url: "https://api.heroku.com/apps/mengkuceng/formation/worker",
      data: { quantity: 1 },
      headers: {
        Accept: "application/vnd.heroku+json; version=3",
        Authorization: "Bearer " + auth1,
        "Content-Type": "application/json",
      },
    });
    axios({
      method: "PATCH",
      url: "https://api.heroku.com/apps/mengkuceng2/formation/worker",
      data: { quantity: 0 },
      headers: {
        Accept: "application/vnd.heroku+json; version=3",
        Authorization: "Bearer " + auth2,
        "Content-Type": "application/json",
      },
    });
  }, 5000);
}

module.exports = {
  turnSelfOn,
};
