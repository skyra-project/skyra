const Constants = require("./constants.js");
const RethinkDB = require("./rethinkDB.js");

const { parseString } = require("xml2js");
const snek = require("snekfetch");
const request = require("request");
const ms = require("ms");

const $ = (name) => { throw new Error(`${name} is a required argument.`); };

/* eslint-disable no-underscore-dangle */
class Wrappers {
  static parseString(input) {
    return new Promise((resolve, reject) => parseString(input, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    }));
  }

  static requestJSON(options = $("URL")) {
    if (typeof options === "string") options = { url: options };
    Object.assign(options, { json: true });
    return this.request(options);
  }

  static requestXML(options = $("URL")) {
    if (typeof options === "string") options = { url: options };
    return this.request(options).then(this.parseString);
  }

  static request(options = $("URL")) {
    if (typeof options === "string") options = { url: options };
    return new Promise((resolve, reject) => request(options, (error, response, body) => {
      if (response && response.statusCode !== 200) reject(Wrappers.httpError(response.statusCode));
      else if (error) reject(error);
      resolve(body);
    }));
  }

  static canvasAvatar(url) {
    url = url.replace(/(png|jpg|jpeg|gif|webp)/, "png");
    return snek.get(url).then(data => data.body).catch((e) => { throw new Error(`Could not download the profile avatar: ${e}`); });
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

  static httpError(status) {
    return `[${status}] ${Constants.httpResponses(status) || ""}`;
  }

  static copyPaste(msg) {
    const embed = msg.embeds.length ? msg.client.funcs.embed(msg.embeds[0]) : null;
    const content = msg.content;
    return msg.channel.send(content, { embed });
  }
}

exports.init = (client) => {
  client.constants = new Constants(client);
  client.wrappers = Wrappers;
  client.rethink = RethinkDB;
  client.version = "1.7";
};
