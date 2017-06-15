const http = require("http");
const Snekfetch = require("snekfetch");
const parseString = require("util").promisify(require("xml2js").parseString);

const func = async (url, options = {}) => new Snekfetch(options.method || "GET", url, options)
    .then(async ({ text }) => {
      if (options.json) try { text = JSON.parse(text); } catch (e) { throw `Error while parsing JSON: ${e}`; }
      else if (options.xml) text = await parseString(text).catch((e) => { throw `Error while parsing XML: ${e}`; });
      return text;
    })
    .catch((e) => { throw { message: `[${e.status}] ${http.STATUS_CODES[e.status]}`, e }; });

func.JSON = (url, options = {}) => func(url, Object.assign(options, { json: true }));
func.XML = (url, options = {}) => func(url, Object.assign(options, { xml: true }));

module.exports = func;
