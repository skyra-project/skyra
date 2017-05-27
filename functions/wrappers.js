const RethinkDB = require("./rethinkDB.js");
const snekfetch = require("snekfetch");
const ms = require("ms");

/* eslint-disable no-underscore-dangle */
class Wrappers {

  static canvasAvatar(url) {
    url = url.replace(/(png|jpg|jpeg|gif|webp)/, "png");
    return snekfetch.get(url).then(data => data.body).catch((e) => { throw new Error(`Could not download the profile avatar: ${e}`); });
  }

  static timer(time) {
    let msTime = 0;
    for (const t of time[Symbol.iterator]()) { // eslint-disable-line no-restricted-syntax
      const parsed = ms(t);
      if (!parsed) throw new Error("Invalid time input.");
      msTime += parsed;
    }
    return msTime;
  }

  static copyPaste(msg) {
    const embed = msg.embeds.length ? msg.client.funcs.embed(msg.embeds[0]) : null;
    const content = msg.content;
    return msg.channel.send(content, { embed });
  }
}

exports.init = (client) => {
  client.wrappers = Wrappers;
  client.rethink = RethinkDB;
  client.version = "1.7";
};
