const now = require("performance-now");
const chalk = require("chalk");

const clk = new chalk.constructor({ enabled: true });

exports.run = (client, msg, mes, start) => {
  if (client.config.cmdLogging) {
    clk.enabled = !client.config.disableLogColor;
    client.emit("log", [
      `${msg.cmdMsg.cmd.help.name}(${msg.cmdMsg.args.join(", ")})`,
      msg.cmdMsg.reprompted ? `${clk.bgRed(`[${(now() - start).toFixed(2)}ms]`)}` : `${clk.bgBlue(`[${(now() - start).toFixed(2)}ms]`)}`,
      `${clk.black.bgYellow(`${msg.author.username}[${msg.author.id}]`)}`,
      this.channel(msg),
    ].join(" "), "log");
  }
};

exports.channel = (msg) => {
  switch (msg.channel.type) {
    case "text":
      return `${clk.bgGreen(`${msg.guild.name}[${msg.guild.id}]`)}`;
    case "dm":
      return `${clk.bgMagenta("Direct Messages")}`;
    case "group":
      return `${clk.bgCyan(`Group DM => ${msg.channel.owner.username}[${msg.channel.owner.id}]`)}`;
    default:
      return "not going to happen";
  }
};
