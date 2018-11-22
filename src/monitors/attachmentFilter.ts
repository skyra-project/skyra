import { Monitor, MessageEmbed, util: { mute, softban }, constants: { MESSAGE_LOGS, MODERATION: { TYPE_KEYS } }, Permissions: { FLAGS }, Adder } from '../index';

export default class extends Monitor {

	/** @param {SKYRA.SkyraMessage} message The message */
	async run(message) {
		if (await message.hasAtLeastPermissionLevel(5)) return;

		const { selfmod } = message.guild.settings;
		if (!message.guild.security.adder) message.guild.security.adder = new Adder(selfmod.attachmentMaximum, selfmod.attachmentDuration);

		try {
			message.guild.security.adder.add(message.author.id, message.attachments.size);
			return;
		} catch (_) {
			// eslint-disable-next-line no-bitwise
			switch (selfmod.attachmentAction & 0b111) {
				case 0b000: await this.actionAndSend(message, TYPE_KEYS.WARN, () =>
					null); break;
				case 0b001: await this.actionAndSend(message, TYPE_KEYS.KICK, () =>
					message.member.kick()
						.catch((error) => this.client.emit('apiError', error))); break;
				case 0b010: await this.actionAndSend(message, TYPE_KEYS.MUTE, () =>
					mute(message.guild.me, message.member, 'AttachmentFilter: Threshold Reached.')
						.catch((error) => this.client.emit('apiError', error)), false); break;
				case 0b011: await this.actionAndSend(message, TYPE_KEYS.SOFT_BAN, () =>
					// @ts-ignore
					softban(message.guild, this.client.user, message.author, 'AttachmentFilter: Threshold Reached.', 1)
						.catch((error) => this.client.emit('apiError', error)), false); break;
				case 0b100: await this.actionAndSend(message, TYPE_KEYS.BAN, () =>
					message.member.ban()
						.catch((error) => this.client.emit('apiError', error))); break;
			}
			// eslint-disable-next-line no-bitwise
			if (selfmod.attachmentAction & 0b1000) {
				this.client.emit('guildMessageLog', MESSAGE_LOGS.kModeration, message.guild, () => new MessageEmbed()
					.setColor(0xefae45)
					.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
					// @ts-ignore
					.setFooter(`#${message.channel.name} | ${message.language.get('CONST_MONITOR_ATTACHMENTFILTER')}`)
					.setTimestamp());
			}
		}
	}
	/**
	 * @param {SKYRA.SkyraMessage} message The message
	 * @param {SKYRA.ModerationTypesEnum} type The type
	 * @param {Function} performAction The action to perform
	 * @param {boolean} [createModerationLog=true] Whether or not this should create a new moderation log entry
	 */
	async actionAndSend(message, type, performAction, createModerationLog = true) {
		const lock = message.guild.moderation.createLock();
		await performAction();
		if (createModerationLog) {
			await message.guild.moderation.new
				.setModerator(this.client.user.id)
				.setUser(message.author.id)
				.setDuration(message.guild.settings.selfmod.attachmentPunishmentDuration)
				.setReason('AttachmentFilter: Threshold Reached.')
				.setType(type)
				.create();
		}
		lock();
	}

	shouldRun(msg) {
		if (!this.enabled || !msg.guild || !msg.attachments.size || msg.author.id === this.client.user.id) return false;

		const { selfmod } = msg.guild.settings;
		if (!selfmod.attachment || selfmod.ignoreChannels.includes(msg.channel.id)) return false;

		const guildMe = msg.guild.me;

		// eslint-disable-next-line no-bitwise
		switch (selfmod.attachmentAction & 0b11) {
			case 0b000: return guildMe.roles.highest.position > msg.member.roles.highest.position;
			case 0b001: return msg.member.kickable;
			case 0b010: return msg.guild.settings.roles.muted && guildMe.roles.highest.position > msg.member.roles.highest.position && guildMe.permissions.has(FLAGS.MANAGE_ROLES);
			case 0b011: return msg.member.bannable;
			case 0b100: return msg.member.bannable;
			default: return false;
		}
	}

};
