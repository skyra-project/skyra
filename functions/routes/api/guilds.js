const router = require("express").Router();
const schema = require("../../schema");
const SettingResolver = require("../../settingResolver");

/* eslint-disable class-methods-use-this */
module.exports = class RouterGuild {

    constructor(client, util) {
        this.client = client;
        this.server = router;
        this.util = util;
        this.settingResolver = new SettingResolver(client);
        this.schema = schema.find("");
        this.getRoot = schema.find;

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

        this.server.get("/:guild/channels/:channel/messages", this.util.gateway.admin, (req, res) => {
            this.util.getGuild(req, res, guild => this.util.getChannel(req, res, guild, channel => this.util.readChannel(req, res, channel, () => {
                const options = { limit: 100 };
                if (req.query.before) options.before = req.query.before;
                if (req.query.after) options.before = req.query.after;
                if (req.query.around) options.before = req.query.around;
                channel.fetchMessages(options)
                    .then(messages => this.util.sendMessage(res, this.serializeList(messages, "message")))
                    .catch(err => this.util.sendError(res, err));
            })));
        });

        this.server.get("/:guild/channels/:channel/messages/:message", this.util.gateway.admin, (req, res) => {
            this.util.getGuild(req, res, guild => this.util.getChannel(req, res, guild, channel => this.util.readChannel(req, res, channel, () => {
                channel.fetchMessage(req.params.message)
                    .then(message => this.util.sendMessage(res, message))
                    .catch(err => this.util.sendError(res, err));
            })));
        });

        this.server.delete("/:guild/channels/:channel/messages/:message", this.util.gateway.admin, (req, res) => {
            this.util.getGuild(req, res, guild => this.util.getChannel(req, res, guild, channel => this.util.readChannel(req, res, channel, () => {
                channel.fetchMessage(req.params.message)
                    .then((message) => {
                        if (!message.deletable) return this.util.throw(res, ...this.util.error.MISSING_PERMISSION("MANAGE_MESSAGES"));
                        return message.delete()
                            .then(() => this.util.sendMessage(res, `Successfully deleted the message '${message.id}' with content of: '${message.content}'`))
                            .catch(err => this.util.sendError(res, err));
                    })
                    .catch(err => this.util.sendError(res, err));
            })));
        });

        this.server.put("/:guild/channels/:channel/messages/:message", this.util.gateway.admin, (req, res) => {
            this.util.getGuild(req, res, guild => this.util.getChannel(req, res, guild, channel => this.util.readChannel(req, res, channel, () => {
                if (!req.body.content) return this.util.throw(res, ...this.util.error.ERROR(`Cannot edit the message '${req.params.message}', you didn't provide a content.`));
                return channel.fetchMessage(req.params.message)
                    .then((message) => {
                        if (!message.editable) return this.util.throw(res, ...this.util.error.ERROR(`Cannot edit the message '${req.params.message}', it is not mine.`));
                        return message.edit()
                            .then(() => this.util.sendMessage(res, `Successfully deleted the message '${message.id}' with content of: '${message.content}'`))
                            .catch(err => this.util.sendError(res, err));
                    })
                    .catch(err => this.util.sendError(res, err));
            })));
        });

        /* Settings */
        this.server.get("/:guild/settings", this.util.gateway.auth, (req, res) => {
            this.util.getGuild(req, res, guild => this.util.executeLevel(req, res, 3, guild, () => {
                this.util.sendMessage(res, this.serialize.guildSettings(guild.settings));
            }));
        });
        this.server.put("/:guild/settings", this.util.gateway.auth, (req, res) => {
            this.util.getGuild(req, res, guild => this.util.executeLevel(req, res, 3, guild, () => this.parseSettings(guild, req.body)
                .then(body => guild.settings.update(this.merge(body))
                    .then(() => this.util.sendMessage(res, "Successfully updated."))
                    .catch(err => this.util.sendError(res, err)),
                )
                .catch(err => this.util.throw(res, ...this.util.error.PARSE_ERROR(err)))));
        });

        this.server.get("*", (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT("guilds"));
        });
    }

    async parseSettings(guild, obj) {
        const queue = [];
        for (const key of Object.keys(obj)) {
            const [cat, subcat] = key.split(".");
            if (!this.schema[cat]) throw `The key '${cat}' does not exist in the schema.`;
            else if (!subcat && !this.schema[cat].type) throw `The key '${cat}' requires a property value.`;
            else if (!subcat) queue.push(this.settingResolver.validate(guild, this.schema[cat], obj[key]).then(v => [cat, null, v]).catch((err) => { throw err; }));
            else if (!this.schema[cat][subcat]) throw `The key '${subcat}' does not exist as a property of '${cat}' in the schema.`;
            else queue.push(this.settingResolver.validate(guild, this.schema[cat][subcat], obj[key]).then(v => [cat, subcat, v]).catch((err) => { throw err; }));
        }
        return Promise.all(queue);
    }

    merge(data) {
        const output = {};
        for (const [cat, subcat, value] of data) {
            if (!subcat) output[cat] = value;
            else {
                if (!output[cat]) output[cat] = {};
                output[cat][subcat] = value;
            }
        }
        return output;
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
                user: this.serialize.user(member.user),
                roles: member._roles,
            }),

            guildSettings: settings => ({
                id: settings.id,
                prefix: settings.prefix,
                roles: {
                    admin: settings.roles.admin || null,
                    moderator: settings.roles.moderator || null,
                    staff: settings.roles.staff || null,
                    muted: settings.roles.muted || null,
                },
                events: {
                    channelCreate: settings.events.channelCreate || false,
                    commands: settings.events.commands || false,
                    guildBanAdd: settings.events.guildBanAdd || false,
                    guildBanRemove: settings.events.guildBanRemove || false,
                    guildMemberAdd: settings.events.guildMemberAdd || false,
                    guildMemberRemove: settings.events.guildMemberRemove || false,
                    guildMemberUpdate: settings.events.guildMemberUpdate || false,
                    messageDelete: settings.events.messageDelete || false,
                    messageDeleteBulk: settings.events.messageDeleteBulk || false,
                    messageUpdate: settings.events.messageUpdate || false,
                    roleUpdate: settings.events.roleUpdate || false,
                },
                channels: {
                    announcement: settings.channels.announcement || null,
                    default: settings.channels.default || null,
                    log: settings.channels.log || null,
                    mod: settings.channels.mod || null,
                    spam: settings.channels.spam || null,
                },
                messages: {
                    greeting: settings.messages.greeting || false,
                    farewell: settings.messages.farewell || false,
                    greetingMessage: settings.messages.greetingMessage || null,
                    farewellMessage: settings.messages.farewellMessage || null,
                },
                selfmod: {
                    ghostmention: settings.selfmod.ghostmention || false,
                    inviteLinks: settings.selfmod.inviteLinks || false,
                    nomentionspam: settings.selfmod.nomentionspam || false,
                    nmsthreshold: settings.selfmod.nmsthreshold || false,
                },
                filter: {
                    level: settings.filter.level,
                    raw: settings.filter.raw,
                    regexp: settings.filter.regexp,
                },
                ignoreChannels: settings.ignoreChannels,
                disabledCommands: settings.disabledCommands,
                disabledCmdChannels: settings.disabledCmdChannels,
                publicRoles: settings.publicRoles,
                autoroles: settings.autoroles,
                mode: settings.mode,
                initialRole: settings.initialRole,
            }),

            message: message => ({
                id: message.id,
                createdTimestamp: message.createdTimestamp,
                content: message.content.replace(/[\\_]/g, "\\$&"),
                author: this.serialize.user(message.author),
                attachments: message.attachments.map(attachment => ({
                    filename: attachment.filename,
                    filesize: attachment.filesize,
                    url: attachment.url,
                    proxyURL: attachment.proxyURL,
                    height: attachment.height,
                    width: attachment.width,
                })),
                editable: message.editable,
                deletable: message.deletable,
                pinnable: message.pinnable,
                embeds: message.embeds.map(embed => ({
                    type: embed.type,
                    title: embed.title,
                    description: embed.description,
                    url: embed.url,
                    color: embed.color || "#4f545c",
                    timestamp: embed.timestamp,
                    fields: embed.fields,
                    image: embed.image,
                    video: embed.video,
                    author: embed.author,
                    provider: embed.provider,
                    footer: embed.footer,
                    thumbnail: embed.thumbnail,
                })),
            }),

            user: user => ({
                id: user.id,
                avatar: user.displayAvatarURL(),
                username: user.username,
                discriminator: user.discriminator,
                tag: `${user.username}#${user.discriminator}`,
                bot: user.bot,
            }),
        };
    }

};
