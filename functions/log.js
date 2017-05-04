const moment = require("moment");
const chalk = require("chalk");

const clk = new chalk.constructor({ enabled: true });

function resolveObject(error) {
  error = error.stack || error.message || error;
  let out;
  if (typeof error === "object" && typeof error !== "string") {
    out = require("util").inspect(error, { depth: 0 }); // eslint-disable-line global-require
    if (typeof out === "string" && out.length > 1900) out = error.toString();
  } else { out = error; }

  return out;
}

module.exports = (data, type = "log") => {
  data = resolveObject(data);
  switch (type.toLowerCase()) {
    case "debug":
      console.log(`${clk.bgMagenta(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${data}`);
      break;
    case "warn":
      console.warn(`${clk.black.bgYellow(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${data}`);
      break;
    case "error":
      console.error(`${clk.bgRed(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${data}`);
      break;
    case "log":
      console.log(`${clk.bgBlue(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${data}`);
      break;
    case "command":
      console.log(`${clk.black(clk.bgWhite(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`))} ${data}`);
      break;
      // no default
  }
};
