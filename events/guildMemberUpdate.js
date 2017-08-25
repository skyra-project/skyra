const { Event } = require('../index');
const { MessageEmbed } = require('discord.js');

const colours = {
    EVENTS_GUILDMEMBER_UPDATE_NICKNAME: 0xFFEE58,
    EVENTS_GUILDMEMBER_ADDED_NICKNAME: 0xFFFF4B,
    EVENTS_GUILDMEMBER_REMOVED_NICKNAME: 0xFFDB4B,
    EVENTS_GUILDMEMBER_UPDATE_ROLES: 0xB2FF59
};

module.exports = class extends Event {

    async run(oldMember, newMember) {
        if (this.client.ready !== true || newMember.guild.available !== true) return null;
        let settings = newMember.guild.settings;
        if (settings instanceof Promise) settings = await settings;

        if (settings.events.memberNicknameChange && oldMember.nickname !== newMember.nickname) {
            return this.nickname(settings, oldMember, newMember);
        }

        if (settings.events.memberRolesChange && this._compareRoles(oldMember.roles, newMember.roles) === false) {
            if (newMember.action === 'ROLEADD') {
                delete newMember.action;
                return null;
            }
            return this.roles(settings, oldMember, newMember);
        }

        return null;
    }

    async sendLog(type, footer, member, previous, current, settings) {
        if (!settings.channels.log) return false;
        const channel = member.guild.channels.get(settings.channels.log);
        if (!channel) return settings.update({ channels: { log: null } });

        const i18n = member.guild.language;

        const embed = new MessageEmbed()
            .setColor(colours[type])
            .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
            .setDescription(i18n.get(type, previous, current))
            .setFooter(i18n.get(footer))
            .setTimestamp();

        return channel.send({ embed });
    }

    nickname(settings, oldMember, newMember) {
        let type;
        if (oldMember.nickname && newMember.nickname) type = 'EVENTS_GUILDMEMBER_UPDATE_NICKNAME';
        else if (oldMember.nickname === null) type = 'EVENTS_GUILDMEMBER_ADDED_NICKNAME';
        else type = 'EVENTS_GUILDMEMBER_REMOVED_NICKNAME';

        return this.sendLog(type, 'TYPES_MEMBER_NICKNAME_UPDATE', newMember, oldMember.nickname, newMember.nickname, settings).catch(err => this.handleError(err));
    }

    roles(settings, oldMember, newMember) {
        const added = [];
        const removed = [];

        for (const [key, value] of oldMember.roles) {
            if (newMember.roles.has(key) === false) removed.push(value.name);
        }
        for (const [key, value] of newMember.roles) {
            if (oldMember.roles.has(key) === false) added.push(value.name);
        }

        return this.sendLog('EVENTS_GUILDMEMBER_UPDATE_ROLES', 'TYPES_MEMBER_ROLE_UPDATE', newMember, removed, added, settings).catch(err => this.handleError(err));
    }

    _compareRoles(oldRoles, newRoles) {
        if (oldRoles.size !== newRoles.size) return false;
        for (const role of oldRoles.keys()) {
            if (newRoles.has(role) === false) return false;
        }
        return true;
    }

    handleError(err) {
        return this.client.emit('log', err, 'error');
    }

};
