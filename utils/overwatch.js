const PLAYED_HEROES = require("./overwatch/playedheroes.js");

module.exports = (type, data) => {
  switch (type) {
    case "playedheroes": return PLAYED_HEROES(data);
    // no default
  }

  return null;
};
