import { GuildMessage } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { Adder, AdderError } from '@utils/Adder';
import { MessageLogsEnum, Moderation } from '@utils/constants';
import { floatPromise } from '@utils/util';
import { MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { Monitor } from 'klasa';

const { FLAGS } = Permissions;

export default class extends Monitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationAttachments;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationAttachmentsWithMaximum;

	public async run(message: GuildMessage) {
		// message.guild.settings.get() &&
		// !message.guild.settings.get().includes(message.channel.id) &&
		// this.hasPermissions(message, message.guild.settings.get(GuildSettings.Selfmod.AttachmentAction))

		const [ignoredChannels, shouldRun, action, maximum, duration] = await message.guild.readSettings([
			GuildSettings.Channels.Ignore.All,
			GuildSettings.Selfmod.Attachments.Attachment,
			GuildSettings.Selfmod.Attachments.AttachmentAction,
			GuildSettings.Selfmod.Attachments.AttachmentMaximum,
			GuildSettings.Selfmod.Attachments.AttachmentDuration
		]);

		if (
			!shouldRun ||
			ignoredChannels.includes(message.channel.id) ||
			this.hasPermissions(message, action) ||
			(await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator))
		)
			return;

		const { adders } = message.guild.security;
		if (!adders.attachments) adders.attachments = new Adder(maximum, duration, true);

		try {
			adders.attachments.add(message.author.id, message.attachments.size);
			return;
		} catch (error) {
			const points = (error as AdderError).amount;
			switch (action & 0b111) {
				case 0b000:
					await this.actionAndSend(message, Moderation.TypeCodes.Warning, () => null);
					break;
				case 0b001:
					await this.actionAndSend(message, Moderation.TypeCodes.Kick, async () =>
						floatPromise(
							this,
							message.guild.security.actions.kick({
								userID: message.author.id,
								moderatorID: CLIENT_ID,
								reason:
									maximum === 0
										? await message.fetchLocale(this.reasonLanguageKey)
										: await message.fetchLocale(this.reasonLanguageKeyWithMaximum, { amount: points, maximum })
							})
						)
					);
					break;
				case 0b010:
					await this.actionAndSend(message, Moderation.TypeCodes.Mute, async () =>
						floatPromise(
							this,
							message.guild.security.actions.mute({
								userID: message.author.id,
								moderatorID: CLIENT_ID,
								reason:
									maximum === 0
										? await message.fetchLocale(this.reasonLanguageKey)
										: await message.fetchLocale(this.reasonLanguageKeyWithMaximum, { amount: points, maximum })
							})
						)
					);
					break;
				case 0b011:
					await this.actionAndSend(message, Moderation.TypeCodes.Softban, async () =>
						floatPromise(
							this,
							message.guild.security.actions.softBan(
								{
									userID: message.author.id,
									moderatorID: CLIENT_ID,
									reason:
										maximum === 0
											? await message.fetchLocale(this.reasonLanguageKey)
											: await message.fetchLocale(this.reasonLanguageKeyWithMaximum, { amount: points, maximum })
								},
								1
							)
						)
					);
					break;
				case 0b100:
					await this.actionAndSend(message, Moderation.TypeCodes.Ban, async () =>
						floatPromise(
							this,
							message.guild.security.actions.ban(
								{
									userID: message.author.id,
									moderatorID: CLIENT_ID,
									reason:
										maximum === 0
											? await message.fetchLocale(this.reasonLanguageKey)
											: await message.fetchLocale(this.reasonLanguageKeyWithMaximum, { amount: points, maximum })
								},
								0
							)
						)
					);
					break;
			}
			// noinspection JSBitwiseOperatorUsage
			if (action & 0b1000) {
				this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Moderation, message.guild, async () =>
					new MessageEmbed()
						.setColor(Colors.Red)
						.setAuthor(
							`${message.author.tag} (${message.author.id})`,
							message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
						)
						.setFooter(
							`#${(message.channel as TextChannel).name} | ${await message.fetchLocale(LanguageKeys.Monitors.AttachmentfilterFooter)}`
						)
						.setTimestamp()
				);
			}
		}
	}

	/**
	 * @param message The message
	 * @param type The type
	 * @param performAction The action to perform
	 */
	public async actionAndSend(message: GuildMessage, type: Moderation.TypeCodes, performAction: () => unknown): Promise<void> {
		const lock = message.guild.moderation.createLock();
		await performAction();
		await message
			.guild!.moderation.create({
				userID: message.author.id,
				moderatorID: CLIENT_ID,
				type,
				duration: await message.guild.readSettings(GuildSettings.Selfmod.Attachments.AttachmentDuration),
				reason: 'AttachmentFilter: Threshold Reached.'
			})
			.create();
		lock();
	}

	public shouldRun(message: GuildMessage) {
		return (
			this.enabled &&
			message.guild !== null &&
			message.author !== null &&
			message.webhookID === null &&
			message.attachments.size > 0 &&
			!message.system &&
			message.author.id !== CLIENT_ID
		);
	}

	private async hasPermissions(message: GuildMessage, action: number) {
		const guildMe = message.guild.me!;
		const member = message.member!;
		switch (action & 0b11) {
			case 0b000:
				return guildMe.roles.highest.position > member.roles.highest.position;
			case 0b001:
				return member.kickable;
			case 0b010:
				return (
					(await message.guild.readSettings(GuildSettings.Roles.Muted)) !== null &&
					guildMe.roles.highest.position > member.roles.highest.position &&
					guildMe.permissions.has(FLAGS.MANAGE_ROLES)
				);
			case 0b011:
				return member.bannable;
			case 0b100:
				return member.bannable;
			default:
				return false;
		}
	}
}
