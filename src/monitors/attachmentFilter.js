const { Monitor, MessageEmbed, util: { mute, softban }, constants: { MESSAGE_LOGS }, Permissions: { FLAGS }, Adder } = require('../index');

module.exports = class extends Monitor {

	/** @param {SKYRA.SkyraMessage} msg The message */
	async run(msg) {
		if (await msg.hasAtLeastPermissionLevel(5)) return;

		const { selfmod } = msg.guild.settings;
		if (!msg.guild.security.adder) msg.guild.security.adder = new Adder(selfmod.attachmentMaximum, selfmod.attachmentDuration);

		try {
			msg.guild.security.adder.add(msg.author.id, msg.attachments.size);
			return;
		} catch (_) {
			// eslint-disable-next-line no-bitwise
			switch (selfmod.attachmentAction & 0b11) {
				case 0b00: await msg.member.ban().catch((error) => this.client.emit('apiError', error)); break;
				case 0b01: await msg.member.kick().catch((error) => this.client.emit('apiError', error)); break;
				case 0b10: await mute(msg.guild.me, msg.member, 'AttachmentFilter: Threshold Reached.').catch((error) => this.client.emit('apiError', error)); break;
				case 0b11: {
					const lock = msg.guild.moderation.createLock();
					// @ts-ignore
					await softban(msg.guild, this.client.user, msg.author, 'AttachmentFilter: Threshold Reached.', 1).catch((error) => this.client.emit('apiError', error));
					lock();
					break;
				}
			}
			// eslint-disable-next-line no-bitwise
			if (selfmod.attachmentAction & 0b100) {
				this.client.emit('guildMessageLog', MESSAGE_LOGS.kModeration, msg.guild, () => new MessageEmbed()
					.setColor(0xefae45)
					.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
					// @ts-ignore
					.setFooter(`#${msg.channel.name} | ${msg.language.get('CONST_MONITOR_ATTACHMENTFILTER')}`)
					.setTimestamp());
			}
		}
	}

	shouldRun(msg) {
		if (!this.enabled || !msg.guild || !msg.attachments.size || msg.author.id === this.client.user.id) return false;

		const { selfmod } = msg.guild.settings;
		if (!selfmod.attachment || selfmod.ignoreChannels.includes(msg.channel.id)) return false;

		// eslint-disable-next-line no-bitwise
		switch (selfmod.attachmentAction & 0b11) {
			case 0b00: return msg.member.bannable;
			case 0b01: return msg.member.kickable;
			case 0b10: return msg.guild.me.roles.highest.position > msg.member.roles.highest.position && msg.guild.me.permissions.has(FLAGS.MANAGE_ROLES);
			case 0b11: return msg.member.bannable;
			default: return false;
		}
	}

};
