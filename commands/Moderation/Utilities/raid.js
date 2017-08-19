const { Command } = require('../../../index');
const AntiRaid = require('../../../utils/anti-raid');

const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            botPerms: ['EMBED_LINKS'],
            permLevel: 3,
            mode: 2,

            cooldown: 5,

            usage: '<list|clear>',
            description: 'Manage the Anti-RAID system.'
        });
    }

    async run(msg, [type], settings) {
        if (settings.selfmod.raid !== true) throw 'The Anti-RAID system is not enabled in this server.';
        if (msg.guild.me.permissions.has('KICK_MEMBERS') !== true) throw 'As I do not have the KICK MEMBERS permission, I keep the Anti-RAID unactivated.';

        const data = AntiRaid.get(msg.guild, settings);

        return this[type](msg, data, settings);
    }

    list(msg, data, settings) {
        const embed = new MessageEmbed()
            .setTitle('List of users in the RAID queue')
            .setDescription(Array.from(data.users.keys()).map(user => `<@${user}>`))
            .setFooter(`${data.users.size}/${settings.selfmod.raidthreshold} Users`)
            .setTimestamp();

        return msg.send({ embed });
    }

    clear(msg, data) {
        data.prune();
        return msg.send('Successfully cleared the RAID list.');
    }

};
