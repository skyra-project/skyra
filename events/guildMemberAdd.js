const { Event } = require('../index');
const AntiRaid = require('../utils/anti-raid');
const { MessageEmbed } = require('discord.js');

const colours = {
    EVENTS_GUILDMEMBERADD: 0x76FF03,
    EVENTS_GUILDMEMBERADD_MUTE: 0xFDD835,
    EVENTS_GUILDMEMBERADD_RAID: 0xFF3D00,
    SETTINGS_DELETE_CHANNELS_DEFAULT: 0x7E57C2,
    SETTINGS_DELETE_ROLES_INITIAL: 0x7E57C2,
    SETTINGS_DELETE_ROLES_MUTE: 0x7E57C2
};

module.exports = class extends Event {

    async run(member) {
        if (this.client.ready !== true || member.guild.available !== true) return null;

        let settings = member.guild.settings;
        if (settings instanceof Promise) settings = await settings;

        if (settings.roles.muted && settings.moderation.mutes.has(member.id)) return this.handleMute(member, settings)
            .catch(err => this.handleError(err));
        return this.handle(member, settings).catch(err => this.handleError(err));
    }

    async sendLog(type, member, settings, system = false, extra = null) {
        if (!settings.channels.log) return false;
        const channel = member.guild.channels.get(settings.channels.log);
        if (!channel) return settings.update({ channels: { log: null } });

        const avatar = (system ? this.client.user : member.user).displayAvatarURL();

        const embed = new MessageEmbed()
            .setColor(colours[type])
            .setAuthor(system ? this.client.user.tag : `${member.user.tag} (${member.id})`, avatar)
            .setFooter(member.guild.language.get(type))
            .setTimestamp();

        if (extra && typeof extra === 'string') embed.setDescription(extra);

        return channel.send({ embed });
    }

    async handle(member, settings) {
        if (settings.selfmod.raid === true && member.guild.me.permissions.has('KICK_MEMBERS')) {
            const response = await AntiRaid.add(member.guild, settings, member);
            if (response && Array.isArray(response)) return this.sendLog('EVENTS_GUILDMEMBERADD_RAID', member, settings, true, response.join('\n'));
        }
        if (settings.roles.initial) await this.handleInitialRole(member, settings).catch(err => this.handleError(err));
        if (settings.events.memberAdd) await this.handleMessage(member, settings).catch(err => this.handleError(err));

        return true;
    }

    async handleMessage(member, settings) {
        await this.sendLog('EVENTS_GUILDMEMBERADD', member, settings).catch(err => this.handleError(err));
        if (settings.channels.default && settings.messages.greeting) await this.handleGreeting(member, settings).catch(err => this.handleError(err));
    }

    async handleGreeting(member, settings) {
        const channel = member.guild.channels.get(settings.channels.default);
        if (!channel) {
            await settings.update({ channels: { default: null } });
            await this.sendLog('SETTINGS_DELETE_CHANNELS_DEFAULT', member, settings, true);
            return null;
        }

        return channel.send(this.getMessage(member, settings));
    }

    getMessage(member, settings) {
        return settings.messages.greeting
            .replace(/%MEMBER%/g, member)
            .replace(/%MEMBERNAME%/g, member.user.username)
            .replace(/%GUILD%/g, member.guild.name);
    }

    async handleInitialRole(member, settings) {
        const role = member.guild.roles.get(settings.roles.initial);
        if (!role) {
            await settings.update({ roles: { initial: null } });
            await this.sendLog('SETTINGS_DELETE_ROLES_INITIAL', member, settings, true);
            return null;
        }

        member.action = 'ROLEADD';
        return member.addRole(role);
    }

    async handleMute(member, settings) {
        await this.sendLog('EVENTS_GUILDMEMBERADD_MUTE', member, settings).catch(() => null);
        if (member.guild.me.permissions.has('MANAGE_ROLES') === false) return null;
        const role = member.guild.roles.get(settings.roles.muted);
        if (!role) {
            await settings.update({ roles: { muted: null } });
            await this.sendLog('SETTINGS_DELETE_ROLES_MUTE', member, settings, true);
            return null;
        }
        return member.addRole(role);
    }

    handleError(err) {
        return this.client.emit('log', err, 'error');
    }

};
