const provider = require('../providers/rethink');
const { Monitor } = require('../index');

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            ignoreBots: false
        });

        this.cooldowns = new Set();
    }

    async run(msg, settings) {
        if (msg.author.bot ||
            settings.ignoreChannels.includes(msg.channel.id) ||
            this.cooldown(msg)) return;

        let userProfile = msg.author.profile;
        if (userProfile instanceof Promise) userProfile = await userProfile;
        let memberPoint = msg.member.points;
        if (memberPoint instanceof Promise) memberPoint = await memberPoint;

        try {
            await this.ensureFetchMember(msg);
            const add = Math.round(((Math.random() * 4) + 4) * settings.social.monitorBoost);
            await userProfile.update({ points: msg.author.profile.points + add });
            await memberPoint.update(msg.member.points.score + add);

            await this.handleRoles(msg, settings, memberPoint);
        } catch (err) {
            this.client.emit('log', `Failed to add points to ${msg.author.id}: ${err}`, 'error');
        }
    }

    cooldown(msg) {
        if (this.cooldowns.has(msg.author.id)) return true;
        this.cooldowns.add(msg.author.id);
        setTimeout(() => this.cooldowns.delete(msg.author.id), 60000);
        return false;
    }

    ensureFetchMember(msg) {
        return !msg.member ? msg.guild.fetchMember(msg.author.id) : null;
    }

    async handleRoles(msg, settings, memberPoints) {
        const autoRoles = settings.autoroles;
        if (autoRoles.length === 0 || msg.guild.me.permissions.has('MANAGE_ROLES') === false) return null;

        const autoRole = this.getLatestRole(autoRoles, memberPoints);
        if (autoRole === null) return null;

        const role = msg.guild.roles.get(autoRole.id);
        if (!role) return provider.removeFromArrayByID('guilds', msg.guild.id, 'autoroles', autoRole.id)
            .then(() => this.handleRoles(msg, settings, memberPoints));

        if (msg.member.roles.has(role.id)) return null;

        return msg.member.addRole(role)
            .then(() => settings.social.achieve ? msg.send(msg.language.get('SOCIAL_ACHIEVEMENT', role)) : null);
    }

    getLatestRole(autoRoles, memberPoints) {
        for (let i = autoRoles.length - 1; i > 0; i--) {
            if (autoRoles[i].points < memberPoints.score) return autoRoles[i];
        }
        return null;
    }

};
