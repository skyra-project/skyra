const router = require("express").Router();

module.exports = class RouterGuild {

    constructor(client, util) {
        this.client = client;
        this.server = router;
        this.util = util;

        /* Members */
        this.server.get("/:guild/members", this.util.gateway.auth, (req, res) => {
            this.util.getGuild(req, res, guild => guild.fetchMembers()
                .then(() => this.util.sendMessage(res, this.serializeList(guild.members, "member")))
                .catch(err => this.util.sendError(res, err)));
        });
        this.server.get("/:guild/members/:member", this.util.gateway.auth, (req, res) => {
            this.util.getGuild(req, res, guild => guild.fetchMember(req.params.member)
                .then(member => this.util.sendMessage(res, this.serialize.member(member)))
                .catch(() => this.util.throw(res, ...this.util.error.MEMBER_NOT_FOUND)));
        });

        /* Roles */
        this.server.get("/:guild/roles", this.util.gateway.auth, (req, res) => {
            this.util.getGuild(req, res, guild => this.util.sendMessage(res, this.serializeList(guild.roles, "role")));
        });
        this.server.get("/:guild/roles/:role", this.util.gateway.auth, (req, res) => {
            this.util.getGuild(req, res, (guild) => {
                const role = guild.roles.get(req.params.role);
                if (!role) return this.util.throw(res, ...this.util.error.ROLE_NOT_FOUND);
                return this.util.sendMessage(res, this.serialize.role(role));
            });
        });

        /* Channels */
        this.server.get("/:guild/channels", this.util.gateway.auth, (req, res) => {
            this.util.getGuild(req, res, guild => this.util.sendMessage(res, this.serializeList(guild.channels, "channel")));
        });
        this.server.get("/:guild/channels/:channel", this.util.gateway.auth, (req, res) => {
            this.util.getGuild(req, res, (guild) => {
                const channel = guild.channels.get(req.params.channel);
                if (!channel) return this.util.throw(res, ...this.util.error.CHANNEL_NOT_FOUND);
                return this.util.sendMessage(res, this.serialize.channel(channel));
            });
        });

        this.server.get("*", (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT("guilds"));
        });
    }

    serializeList(map, type) {
        const serializer = this.serialize[type];
        const output = [];
        for (const item of map.values()) output.push(serializer(item));
        return output;
    }

    get serialize() {
        return {
            channel: channel => ({
                id: channel.id,
                type: channel.type,
                name: channel.name,
                permission_overwrites: this.serializeList(channel.permissionOverwrites, "channelPermissions"),
                topic: channel.topic,
                position: channel.position,
                last_message_id: channel.lastMessageID,
            }),
            channelPermissions: perm => ({
                id: perm.id,
                allow: perm._allowed,
                deny: perm._denied,
                type: perm.type,
            }),

            role: role => ({
                id: role.id,
                name: role.name,
                color: role.color,
                mentionable: role.mentionable,
                position: role.position,
                managed: role.managed,
                hoist: role.hoist,
                permissions: role.permissions,
            }),

            member: member => ({
                deaf: member.serverDeaf,
                mute: member.serverMute,
                user: {
                    id: member.user.id,
                    username: member.user.username,
                    discriminator: member.user.discriminator,
                    avatar: member.user.avatar,
                },
                roles: member._roles,
            }),
        };
    }

};
