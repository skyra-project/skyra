const { Channel: fetchChannel } = require("../../functions/search");
const fs = require("fs-nextra");
const { resolve } = require("path");
const moment = require("moment");

exports.send = async (client, msg, channel, sendname, filename) => {
    const file = resolve(client.baseDir, "tracks", filename);
    await this.exist(client, filename);

    clearInterval(channel.trackInterval);
    delete channel.tracking;
    delete channel.tracker;
    delete channel.trackertimer;
    delete channel.trackInterval;

    await msg.author.send(`Understood, there's your file for ${channel}.`, { files: [{ attachment: file, name: sendname }] });
    await fs.unlink(file);

    return true;
};

exports.exist = async (client, filename) => {
    const dir = resolve(client.baseDir, "tracks");
    const files = await fs.readdir(dir) || [];
    if (files.includes(filename)) return true;
    throw "file not found.";
};

exports.write = async (client, filename) => {
    const dir = resolve(client.baseDir, "tracks");
    const file = dir + filename;
    await fs.ensureDir(dir);
    await fs.appendFile(file, `[${moment.utc(new Date().getTime()).format("HH:mm:ss")}] Starting...\r\n\r\n`);
};

exports.run = async (client, msg, [channel = msg.channel]) => {
    channel = await fetchChannel(channel, this.guild);

    if (!channel.tracking) {
        /* Apply properties to Channel */
        channel.tracking = true;
        channel.tracker = msg.author.id;
        channel.trackertimer = msg.createdTimestamp;

        const filename = `${channel.tracker}-${channel.id}-${channel.trackertimer}.txt`;
        this.write(client, filename);

        channel.trackInterval = setInterval(async () => {
            if (new Date().getTime() > channel.trackertimer + 900000) {
                const sendname = `${msg.author.username}-#${channel.name}.txt`;
                return this.send(client, msg, channel, sendname, filename);
            }
            return false;
        }, 5000);

        return msg.author.send(
            `Ok, I'll track ${channel} for you. Use \`&track\` again to stop it.\n` +
            "Otherwise, I'll stop tracking after 15 minutes.\n" +
            "When the tracker stops, I'll send a `.txt` file here.\n",
        );
    } else if (msg.author.id === channel.tracker) {
        const filename = `${channel.tracker}-${channel.id}-${channel.trackertimer}.txt`;
        const sendname = `${msg.author.username}-#${channel.name}.txt`;
        return this.send(client, msg, channel, sendname, filename);
    }
    return msg.send(`I'm sorry, but this channel is being tracked by ${msg.guild.members.get(channel.tracker).user.username}`);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 3,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "track",
    description: "Get EVERY SINGLE MESSAGE from a channel that are sent within 15 minutes or until you stop it.",
    usage: "[channel:channel]",
    usageDelim: "",
};
