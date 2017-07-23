const { Permissions } = require("discord.js");

module.exports = class DashboardGuild {

    constructor(client, guild) {
        this.client = client;
        this.id = guild.id;
        this.name = guild.name;
        this.icon = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` : null;
        this.owner = guild.owner;
        this.permissions = new Permissions(guild.permissions);
    }

    get guild() {
        return this.client.guilds.get(this.id);
    }

};
