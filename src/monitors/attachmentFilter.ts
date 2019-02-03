import { MessageEmbed, Permissions } from 'discord.js';
import { KlasaMessage, Monitor, SettingsFolder } from 'klasa';
import { Adder } from '../lib/util/Adder';
import { MessageLogsEnum, ModerationTypeKeys } from '../lib/util/constants';
import { mute } from '../lib/util/util';
const { FLAGS } = Permissions;

export default class extends Monitor {

	public async run(message: KlasaMessage): Promise<void> {
		if (await message.hasAtLeastPermissionLevel(5)) return;

		const selfmod = (message.guild.settings.get('selfmod') as SettingsFolder)
			.pluck('attachmentAction', 'attachmentMaximum', 'attachmentDuration');

		if (!message.guild.security.adder) message.guild.security.adder = new Adder(selfmod.attachmentMaximum, selfmod.attachmentDuration);

		try {
			message.guild.security.adder.add(message.author.id, message.attachments.size);
			return;
		} catch (_) {
			switch (selfmod.attachmentAction & 0b111) {
				case 0b000: await this.actionAndSend(message, ModerationTypeKeys.Warn, () =>
					null); break;
				case 0b001: await this.actionAndSend(message, ModerationTypeKeys.Kick, () =>
					message.member.kick()
						.catch((error) => this.client.emit('apiError', error))); break;
				case 0b010: await this.actionAndSend(message, ModerationTypeKeys.Mute, () =>
					mute(message.guild.me, message.member, 'AttachmentFilter: Threshold Reached.')
						.catch((error) => this.client.emit('apiError', error)), false); break;
				case 0b011: await this.actionAndSend(message, ModerationTypeKeys.Softban, () =>
					// @ts-ignore
					softban(message.guild, this.client.user, message.author, 'AttachmentFilter: Threshold Reached.', 1)
						.catch((error) => this.client.emit('apiError', error)), false); break;
				case 0b100: await this.actionAndSend(message, ModerationTypeKeys.Ban, () =>
					message.member.ban()
						.catch((error) => this.client.emit('apiError', error)));
			}
			if (selfmod.attachmentAction & 0b1000) {
				this.client.emit('guildMessageLog', MessageLogsEnum.Moderation, message.guild, () => new MessageEmbed()
					.setColor(0xEFAE45)
					.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
					// @ts-ignore
					.setFooter(`#${message.channel.name} | ${message.language.get('CONST_MONITOR_ATTACHMENTFILTER')}`)
					.setTimestamp());
			}
		}
	}
	/**
	 * @param message The message
	 * @param type The type
	 * @param performAction The action to perform
	 * @param createModerationLog Whether or not this should create a new moderation log entry
	 */
	public async actionAndSend(message: KlasaMessage, type: ModerationTypeKeys, performAction: () => Promise<unknown>, createModerationLog: boolean = true): Promise<void> {
		const lock = message.guild.moderation.createLock();
		await performAction();
		if (createModerationLog) {
			await message.guild.moderation.new
				.setModerator(this.client.user.id)
				.setUser(message.author.id)
				.setDuration(message.guild.settings.get('selfmod.attachmentPunishmentDuration') as number)
				.setReason('AttachmentFilter: Threshold Reached.')
				.setType(type)
				.create();
		}
		lock();
	}

	public shouldRun(message: KlasaMessage): boolean {
		if (!this.enabled || !message.guild || !message.attachments.size || message.author.id === this.client.user.id) return false;

		const selfmod = (message.guild.settings.get('selfmod') as SettingsFolder)
			.pluck('attachment', 'attachmentAction', 'attachmentMaximum', 'attachmentDuration', 'ignoreChannels');
		if (!selfmod.attachment || selfmod.ignoreChannels.includes(message.channel.id)) return false;

		const guildMe = message.guild.me;

		switch (selfmod.attachmentAction & 0b11) {
			case 0b000: return guildMe.roles.highest.position > message.member.roles.highest.position;
			case 0b001: return message.member.kickable;
			case 0b010: return message.guild.settings.get('roles.muted') && guildMe.roles.highest.position > message.member.roles.highest.position && guildMe.permissions.has(FLAGS.MANAGE_ROLES);
			case 0b011: return message.member.bannable;
			case 0b100: return message.member.bannable;
			default: return false;
		}
	}

}
