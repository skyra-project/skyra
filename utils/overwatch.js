const PLAYED_HEROES = require("./overwatch/playedheroes.js");

module.exports = (type, data, options) => {
  switch (type) {
    case "playedheroes": return PLAYED_HEROES(data, options);
    // no default
  }

  return null;
};
