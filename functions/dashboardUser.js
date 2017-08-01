const { Collection } = require('discord.js');
const DashboardGuild = require('./dashboardGuild');

module.exports = class DashboardUser {

    constructor(client, user) {
        this.client = client;
        this.id = user.id;
        this.username = user.username;
        this.discriminator = user.discriminator;
        this.avatar = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'webp'}` : null;
        this.guilds = new Collection();
        this.constructor.setupGuilds(this, user.guilds);
        this.managableGuilds = this.guilds.filter(guild => guild.permissions.has('MANAGE_GUILD'));
    }

    get user() {
        return this.client.users.get(this.id);
    }

    get tag() {
        return `${this.username}#${this.discriminator}`;
    }

    static setupGuilds(dashboardUser, guilds) {
        guilds.forEach((guild) => {
            dashboardUser.guilds.set(guild.id, new DashboardGuild(dashboardUser.client, guild));
        });
    }

};
