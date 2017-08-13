const { Command } = require('../../../index');
const fs = require('fs-nextra');
const { resolve } = require('path');
const moment = require('moment');

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'track', {
            guildOnly: true,
            permLevel: 1,
            mode: 2,
            cooldown: 30,

            usage: '[channel:advchannel]',
            description: 'Get EVERY SINGLE MESSAGE from a channel that are sent within 15 minutes or until you stop it.'
        });
    }

    async run(msg, [channel = msg.channel]) {
        if (!channel.tracking) {
            /* Apply properties to Channel */
            channel.tracking = true;
            channel.tracker = msg.author.id;
            channel.trackertimer = msg.createdTimestamp;

            const filename = `${channel.tracker}-${channel.id}-${channel.trackertimer}.txt`;
            await this.write(filename);

            channel.trackInterval = setInterval(async () => {
                if (Date.now() > channel.trackertimer + 900000) {
                    const sendname = `${msg.author.username}-#${channel.name}.txt`;
                    return this.send(msg, channel, sendname, filename);
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
            return this.send(msg, channel, sendname, filename);
        }
        return msg.send(`I'm sorry, but this channel is being tracked by ${msg.guild.members.get(channel.tracker).user.username}`);
    }

    async send(msg, channel, sendname, filename) {
        const file = this.resolvePath('tracks', filename);
        await this.exist(filename);

        clearInterval(channel.trackInterval);
        delete channel.tracking;
        delete channel.tracker;
        delete channel.trackertimer;
        delete channel.trackInterval;

        await msg.author.send(`Understood, there's your file for ${channel}.`, { files: [{ attachment: file, name: sendname }] });
        await fs.unlink(file);

        return true;
    }

    async exist(filename) {
        const dir = this.resolvePath('tracks');
        const files = await fs.readdir(dir) || [];
        if (files.includes(filename)) return true;
        throw 'file not found.';
    }

    async write(filename) {
        const dir = this.resolvePath('tracks');
        const file = dir + filename;
        await fs.ensureDir(dir);
        await fs.appendFile(file, `[${moment.utc(Date.now()).format('HH:mm:ss')}] Starting...\r\n\r\n`);
    }

    resolvePath(...paths) {
        return resolve(this.client.baseDir, ...paths);
    }

};
