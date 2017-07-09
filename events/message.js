const now = require("performance-now");
const handleError = require("../functions/handleError");
const getPrefix = require("../functions/getPrefix");

exports.run = async (client, msg) => {
    if (!client.ready) return;
    this.runMessageMonitors(client, msg);
    if (!this.handleMessage(client, msg)) return;
    const res = await this.parseCommand(client, msg);
    if (!res.command) return;
    this.handleCommand(client, msg, res);
};

exports.runMessageMonitors = (client, msg) => {
    const settings = msg.guildSettings;
    const run = [];
    for (const monitor of client.messageMonitors.values()) {
        if (monitor.conf.guildOnly === !!msg.guild) run.push(monitor.run(client, msg, settings));
    }
    return Promise.all(run).catch(error => client.emit("log", error, "error"));
};

exports.handleMessage = (client, msg) => {
    if (client.config.ignoreBots && msg.author.bot) return false;
    if (client.config.ignoreSelf && msg.author.id === client.user.id) return false;
    if (!client.user.bot && msg.author.id !== client.user.id) return false;
    if (client.user.bot && msg.author.id === client.user.id) return false;
    return true;
};

exports.parseCommand = async (client, msg, usage = false) => {
    const prefix = await getPrefix(client, msg);
    if (!prefix) return false;
    const prefixLength = this.getLength(client, msg, prefix);
    if (usage) return prefixLength;
    return {
        command: msg.content.slice(prefixLength).split(" ")[0].toLowerCase(),
        prefix,
        prefixLength,
    };
};

exports.getLength = (client, msg, prefix) => {
    if (client.config.prefixMention === prefix) return prefix.exec(msg.content)[0].length + 1;
    return prefix.exec(msg.content)[0].length;
};

exports.handleCommand = (client, msg, { command, prefix, prefixLength }) => {
    const validCommand = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!validCommand) return;
    const start = now();
    const response = this.runInhibitors(client, msg, validCommand);
    if (response) {
        if (typeof response === "string") msg.reply(response);
        return;
    }
    msg.cmdMsg = new client.CommandMessage(msg, validCommand, prefix, prefixLength);
    this.runCommand(client, msg, start);
};

exports.runCommand = (client, msg, start) => msg.cmdMsg.validateArgs()
    .then(params => msg.cmdMsg.cmd.run(msg, params)
        .then(mes => this.runFinalizers(client, msg, mes, start))
        .catch(error => handleError(client, msg, error)),
    )
    .catch(error => handleError(client, msg, error));

exports.runInhibitors = (client, msg, command) => {
    let response;
    client.commandInhibitors.some((inhibitor) => {
        if (inhibitor.conf.enabled) {
            response = inhibitor.run(client, msg, command);
            if (response) return true;
        }
        return false;
    });
    return response;
};

exports.runFinalizers = (client, msg, mes, start) => {
    Promise.all(client.commandFinalizers.map(item => item.run(client, msg, mes, start)));
};
