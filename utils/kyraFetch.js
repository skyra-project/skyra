/* Node.js dependencies */
const http = require("http");
const https = require("https");
const { parse } = require("url");
const { stringify } = require("querystring");

/* External dependencies */
const { parseStringAsync } = require("util").promisify(require("xml2js").parseString);

/* eslint-disable no-use-before-define */
exports.kyraFetch = (url, options = {}) => new Promise((resolve, reject) => {
  const httpData = parse(url += options.qs ? `?${stringify(options.qs)}` : "");
  const request = httpData;
  request.headers = {};
  if (request.method === "POST") request.headers["Content-Length"] = Buffer.byteLength(stringify(options.body));

  if (options.json) {
    delete options.json;
    request.headers["content-type"] = "application/json";
  }
  if (options.xml) {
    delete options.xml;
    request.headers["content-type"] = "text/xml";
  }
  Object.assign(request, options);
  if (!request.method) request.method = "GET";

  let data = "";
  const req = (httpData.protocol === "https:" ? https : http).request(request, (res) => {
    const { statusCode } = res;

    if (statusCode !== 200) {
      res.resume();
      reject(`[${statusCode}] ${http.STATUS_CODES[statusCode]}`);
      return;
    }
    res.setEncoding(options.encoding || "utf8");
    res.on("abort", reject);
    res.on("aborted", reject);
    res.on("error", reject);
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", async () => {
      if (request.headers["content-type"] === "application/json") {
        try { data = JSON.parse(data); } catch (e) { reject(`Error while parsing JSON: ${e}`); }
      } else if (request.headers["content-type"] === "text/xml") {
        data = await parseStringAsync(data).catch(e => reject(`Error while parsing XML: ${e}`));
      }
      Object.assign(request.headers, res);
      resolve({ request, data });
    });
  });

  if (request.method === "POST") req.write(stringify(options.body));
  req.on("error", reject);
  req.end();
});

exports.JSON = (url, options = {}) => {
  if (!("headers" in options)) options.headers = {};
  Object.assign(options.headers, { "content-type": "application/json" });
  return this.kyraFetch(url, options);
};

exports.XML = (url, options = {}) => {
  if (!("headers" in options)) options.headers = {};
  Object.assign(options.headers, { "content-type": "text/xml" });
  return this.kyraFetch(url, options);
};
