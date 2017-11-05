/* eslint-disable class-methods-use-this, new-cap */
const router = require('express').Router();

module.exports = class RouterGuild {

	constructor(client, util) {
		this.client = client;
		this.server = router;
		this.util = util;

		this.server.param('guild', (req, res, next, id) => {
			const guild = this.client.guilds.get(id);
			if (!guild) return this.throw(res, ...this.util.error.GUILD_NOT_FOUND);
			if (!guild.available) return this.throw(res, ...this.error.GUILD_UNAVAILABLE);

			req.guild = guild;
			return next();
		});

		/* Members */
		this.server.get('/:guild/members', this.util.gateway.auth, (req, res) => {
			req.guild.members.fetch()
				.then(() => this.util.sendMessage(res, this.serializeList(req.guild.members, 'member')))
				.catch(err => this.util.sendError(res, err));
		});
		this.server.get('/:guild/members/:member', this.util.gateway.auth, (req, res) => {
			req.guild.members.fetch(req.params.member)
				.then(member => this.util.sendMessage(res, this.serialize.member(member)))
				.catch(() => this.util.throw(res, ...this.util.error.MEMBER_NOT_FOUND));
		});

		/* Roles */
		this.server.get('/:guild/roles', this.util.gateway.auth, (req, res) => {
			this.util.sendMessage(res, this.serializeList(req.guild.roles, 'role'));
		});
		this.server.get('/:guild/roles/:role', this.util.gateway.auth, (req, res) => {
			const role = req.guild.roles.get(req.params.role);
			if (!role) return this.util.throw(res, ...this.util.error.ROLE_NOT_FOUND);
			return this.util.sendMessage(res, this.serialize.role(role));
		});

		/* Channels */
		this.server.get('/:guild/channels', this.util.gateway.auth, (req, res) => {
			this.util.sendMessage(res, this.serializeList(req.guild.channels, 'channel'));
		});
		this.server.get('/:guild/channels/:channel', this.util.gateway.auth, (req, res) => {
			const channel = req.guild.channels.get(req.params.channel);
			if (!channel) return this.util.throw(res, ...this.util.error.CHANNEL_NOT_FOUND);
			return this.util.sendMessage(res, this.serialize.channel(channel));
		});

		/* Settings */
		this.server.get('/:guild/settings', this.util.gateway.auth, (req, res) => {
			this.util.executeLevel(req, res, 3, req.guild, () => {
				this.util.sendMessage(res, this.serialize.guildSettings(req.guild.settings));
			});
		});
		this.server.put('/:guild/settings', this.util.gateway.auth, (req, res) => {
			this.util.executeLevel(req, res, 3, req.guild, () => this.client.settings.guilds.updateMany(req.guild, req.body)
				.then(body => req.guild.settings.update(this.merge(body))
					.then(() => this.util.sendMessage(res, 'Successfully updated.'))
					.catch(err => this.util.sendError(res, err)),
				)
				.catch(err => this.util.throw(res, ...this.util.error.PARSE_ERROR(err))));
		});

		this.server.get('*', (req, res) => {
			this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT('guilds'));
		});
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
				permission_overwrites: this.serializeList(channel.permissionOverwrites, 'channelPermissions'), // eslint-disable-line camelcase
				topic: channel.topic,
				position: channel.position,
				last_message_id: channel.lastMessageID // eslint-disable-line camelcase
			}),
			channelPermissions: perm => ({
				id: perm.id,
				allow: perm._allowed,
				deny: perm._denied,
				type: perm.type
			}),

			role: role => ({
				id: role.id,
				name: role.name,
				color: role.color,
				mentionable: role.mentionable,
				position: role.position,
				managed: role.managed,
				hoist: role.hoist,
				permissions: role.permissions
			}),

			member: member => ({
				deaf: member.serverDeaf,
				mute: member.serverMute,
				user: this.serialize.user(member.user),
				roles: member._roles
			}),

			guildSettings: settings => ({ // eslint-disable-line complexity
				id: settings.id,
				prefix: settings.prefix,
				roles: {
					admin: settings.roles.admin || null,
					moderator: settings.roles.moderator || null,
					staff: settings.roles.staff || null,
					muted: settings.roles.muted || null
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
					roleUpdate: settings.events.roleUpdate || false
				},
				channels: {
					announcement: settings.channels.announcement || null,
					default: settings.channels.default || null,
					log: settings.channels.log || null,
					mod: settings.channels.modlog || null,
					spam: settings.channels.spam || null
				},
				messages: {
					greeting: settings.messages.greeting || false,
					farewell: settings.messages.farewell || false,
					greetingMessage: settings.messages.greetingMessage || null,
					farewellMessage: settings.messages.farewellMessage || null
				},
				selfmod: {
					ghostmention: settings.selfmod.ghostmention || false,
					inviteLinks: settings.selfmod.inviteLinks || false,
					nomentionspam: settings.selfmod.nomentionspam || false,
					nmsthreshold: settings.selfmod.nmsthreshold || false
				},
				filter: {
					level: settings.filter.level,
					raw: settings.filter.raw,
					regexp: settings.filter.regexp
				},
				ignoreChannels: settings.ignoreChannels,
				disabledCommands: settings.disabledCommands,
				disabledCmdChannels: settings.disabledCmdChannels,
				publicRoles: settings.publicRoles,
				autoroles: settings.autoroles,
				mode: settings.mode,
				initialRole: settings.initialRole
			}),

			message: message => ({
				id: message.id,
				createdTimestamp: message.createdTimestamp,
				content: message.content.replace(/[\\_]/g, '\\$&'),
				author: this.serialize.user(message.author),
				attachments: message.attachments.map(attachment => ({
					filename: attachment.filename,
					filesize: attachment.filesize,
					url: attachment.url,
					proxyURL: attachment.proxyURL,
					height: attachment.height,
					width: attachment.width
				})),
				editable: message.editable,
				deletable: message.deletable,
				pinnable: message.pinnable,
				embeds: message.embeds.map(embed => ({
					type: embed.type,
					title: embed.title,
					description: embed.description,
					url: embed.url,
					color: embed.color || '#4f545c',
					timestamp: embed.timestamp,
					fields: embed.fields,
					image: embed.image,
					video: embed.video,
					author: embed.author,
					provider: embed.provider,
					footer: embed.footer,
					thumbnail: embed.thumbnail
				}))
			}),

			user: user => ({
				id: user.id,
				avatar: user.displayAvatarURL(),
				username: user.username,
				discriminator: user.discriminator,
				tag: `${user.username}#${user.discriminator}`,
				bot: user.bot
			})
		};
	}

};
