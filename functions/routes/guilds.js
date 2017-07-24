const router = require("express").Router();

module.exports = class Router {

    constructor(client) {
        this.client = client;
        this.server = router;

        /* Members */
        const serializeMember = member => ({
            deaf: member.serverDeaf,
            mute: member.serverMute,
            user: {
                id: member.user.id,
                username: member.user.username,
                discriminator: member.user.discriminator,
                avatar: member.user.avatar,
            },
            roles: member._roles,
        });
        this.server.get("/:id/members", (req, res) => {
            const guild = client.guilds.get(req.params.id);
            if (!guild) return res.status(404).redirect("/");
            return guild.fetchMembers()
                .then(() => res.json({ success: true, data: Array.from(guild.members.values()).map(serializeMember) }))
                .catch(err => res.status(500).send(err));
        });
        this.server.get("/:id/members/:member", (req, res) => {
            const guild = client.guilds.get(req.params.id);
            if (!guild) return res.status(404).redirect("/");
            return guild.fetchMember(req.params.member)
                .then(member => res.json({ success: true, data: serializeMember(member) }))
                .catch(() => res.json({ success: false, message: "Member not found" }));
        });

        const serializeRole = role => ({
            id: role.id,
            name: role.name,
            color: role.color,
            mentionable: role.mentionable,
            position: role.position,
            managed: role.managed,
            hoist: role.hoist,
            permissions: role.permissions,
        });
        this.server.get("/:id/roles", (req, res) => {
            const guild = client.guilds.get(req.params.id);
            if (!guild) return res.status(404).redirect("/");
            return res.json({ success: true, data: Array.from(guild.roles.values()).map(serializeRole) });
        });
        this.server.get("/:id/roles/:role", (req, res) => {
            const guild = client.guilds.get(req.params.id);
            if (!guild) return res.status(404).redirect("/");
            const role = guild.roles.get(req.params.role);
            if (!role) return res.json({ success: false, message: "Role not found" });
            return res.json({ success: true, data: serializeRole(role) });
        });

        const serializeChannelPermissions = perm => ({
            id: perm.id,
            allow: perm._allowed,
            deny: perm._denied,
            type: perm.type,
        });
        const serializeChannel = channel => ({
            id: channel.id,
            type: channel.type,
            name: channel.name,
            permission_overwrites: Array.from(channel.permissionOverwrites.values()).map(serializeChannelPermissions),
            topic: channel.topic,
            position: channel.position,
            last_message_id: channel.lastMessageID,
        });
        this.server.get("/:id/channels", (req, res) => {
            const guild = client.guilds.get(req.params.id);
            if (!guild) return res.status(404).redirect("/");
            return res.json({ success: true, data: Array.from(guild.channels.values()).map(serializeChannel) });
        });
        this.server.get("/:id/channels/:channel", (req, res) => {
            const guild = client.guilds.get(req.params.id);
            if (!guild) return res.status(404).redirect("/");
            const channel = guild.channels.get(req.params.channel);
            if (!channel) return res.json({ success: false, message: "Channel not found" });
            return res.json({ success: true, data: serializeChannel(channel) });
        });
    }

};
