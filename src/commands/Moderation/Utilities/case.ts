import { getAction, getTranslationKey, type ModerationEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedLanguageT, getSupportedUserLanguageT } from '#lib/i18n/translate';
import { SkyraCommand, SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { minutes, seconds, years } from '#utils/common';
import { BrandingColors } from '#utils/constants';
import { getModeration } from '#utils/functions';
import { TypeVariation } from '#utils/moderationConstants';
import { resolveCase, resolveTimeSpan } from '#utils/resolvers';
import { getFullEmbedAuthor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessageEmbedFields } from '@sapphire/discord.js-utilities';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, createLocalizedChoice, type TFunction } from '@sapphire/plugin-i18next';
import { cutText, isNullish, isNullishOrEmpty, isNullishOrZero } from '@sapphire/utilities';
import {
	chatInputApplicationCommandMention,
	Collection,
	EmbedBuilder,
	inlineCode,
	MessageFlags,
	PermissionFlagsBits,
	time,
	TimestampStyles,
	User,
	type EmbedField
} from 'discord.js';

const Root = LanguageKeys.Commands.Case;
const RootModeration = LanguageKeys.Moderation;
const OverviewColors = [0x80f31f, 0xa5de0b, 0xc7c101, 0xe39e03, 0xf6780f, 0xfe5326, 0xfb3244];

@ApplyOptions<SkyraSubcommand.Options>({
	description: LanguageKeys.Commands.Moderation.CaseDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.CaseExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'show', chatInputRun: 'chatInputRunShow', messageRun: 'showMessageRun', default: true },
		{ name: 'list', chatInputRun: 'chatInputRunList' },
		{ name: 'edit', chatInputRun: 'chatInputRunEdit' },
		{ name: 'archive', chatInputRun: 'chatInputRunArchive' },
		{ name: 'delete', chatInputRun: 'chatInputRunDelete', messageRun: 'deleteMessageRun' }
	]
})
export class UserCommand extends SkyraSubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, Root.Name, Root.Description)
				.setDMPermission(false)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
				.addSubcommand((subcommand) =>
					applyLocalizedBuilder(subcommand, Root.Show) //
						.addIntegerOption((option) => applyLocalizedBuilder(option, Root.OptionsCase).setMinValue(1).setRequired(true))
						.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsShow))
				)
				.addSubcommand((subcommand) =>
					applyLocalizedBuilder(subcommand, Root.List) //
						.addUserOption((option) => applyLocalizedBuilder(option, Root.OptionsUser))
						.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsOverview))
						.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsShow))
						.addIntegerOption((option) =>
							applyLocalizedBuilder(option, Root.OptionsType) //
								.addChoices(
									createLocalizedChoice(RootModeration.TypeAddRole, { value: TypeVariation.AddRole }),
									createLocalizedChoice(RootModeration.TypeBan, { value: TypeVariation.Ban }),
									createLocalizedChoice(RootModeration.TypeKick, { value: TypeVariation.Kick }),
									createLocalizedChoice(RootModeration.TypeMute, { value: TypeVariation.Mute }),
									createLocalizedChoice(RootModeration.TypeRemoveRole, { value: TypeVariation.RemoveRole }),
									createLocalizedChoice(RootModeration.TypeRestrictedAttachment, { value: TypeVariation.RestrictedAttachment }),
									createLocalizedChoice(RootModeration.TypeRestrictedEmbed, { value: TypeVariation.RestrictedEmbed }),
									createLocalizedChoice(RootModeration.TypeRestrictedEmoji, { value: TypeVariation.RestrictedEmoji }),
									createLocalizedChoice(RootModeration.TypeRestrictedReaction, { value: TypeVariation.RestrictedReaction }),
									createLocalizedChoice(RootModeration.TypeRestrictedVoice, { value: TypeVariation.RestrictedVoice }),
									createLocalizedChoice(RootModeration.TypeSetNickname, { value: TypeVariation.SetNickname }),
									createLocalizedChoice(RootModeration.TypeSoftban, { value: TypeVariation.Softban }),
									createLocalizedChoice(RootModeration.TypeVoiceKick, { value: TypeVariation.VoiceKick }),
									createLocalizedChoice(RootModeration.TypeVoiceMute, { value: TypeVariation.VoiceMute }),
									createLocalizedChoice(RootModeration.TypeWarning, { value: TypeVariation.Warning })
								)
						)
				)
				.addSubcommand((subcommand) =>
					applyLocalizedBuilder(subcommand, Root.Edit) //
						.addIntegerOption((option) => applyLocalizedBuilder(option, Root.OptionsCase).setMinValue(1).setRequired(true))
						.addStringOption((option) => applyLocalizedBuilder(option, Root.OptionsReason).setMaxLength(200))
						.addStringOption((option) => applyLocalizedBuilder(option, Root.OptionsDuration).setMaxLength(50))
				)
				.addSubcommand((subcommand) =>
					applyLocalizedBuilder(subcommand, Root.Archive) //
						.addIntegerOption((option) => applyLocalizedBuilder(option, Root.OptionsCase).setMinValue(1).setRequired(true))
				)
				.addSubcommand((subcommand) =>
					applyLocalizedBuilder(subcommand, Root.Delete) //
						.addIntegerOption((option) => applyLocalizedBuilder(option, Root.OptionsCase).setMinValue(1).setRequired(true))
				)
		);
	}

	public async chatInputRunShow(interaction: SkyraSubcommand.Interaction) {
		const entry = await this.#getCase(interaction, true);
		const show = interaction.options.getBoolean('show') ?? false;
		const t = show ? getSupportedLanguageT(interaction) : getSupportedUserLanguageT(interaction);

		return interaction.reply({ embeds: [await entry.prepareEmbed(t)], flags: show ? undefined : MessageFlags.Ephemeral });
	}

	public async chatInputRunList(interaction: SkyraSubcommand.Interaction) {
		const user = interaction.options.getUser('user');
		const show = interaction.options.getBoolean('show') ?? false;
		const type = interaction.options.getInteger('type') as TypeVariation | null;

		const moderation = getModeration(interaction.guild);
		let entries = await (user ? moderation.fetch(user.id) : moderation.fetch());
		if (!isNullish(type)) entries = entries.filter((entry) => entry.type === type);

		const t = show ? getSupportedLanguageT(interaction) : getSupportedUserLanguageT(interaction);
		return interaction.options.getBoolean('overview') //
			? this.#listOverview(interaction, t, entries, user, show)
			: this.#listDetails(interaction, t, entries, show);
	}

	public async chatInputRunEdit(interaction: SkyraSubcommand.Interaction) {
		const entry = await this.#getCase(interaction, true);
		const reason = interaction.options.getString('reason');
		const duration = this.#getDuration(interaction);

		const moderation = getModeration(interaction.guild);
		const t = getSupportedUserLanguageT(interaction);
		if (!isNullish(duration)) {
			const action = getAction(entry.type);
			if (!action.allowSchedule) {
				const content = t(Root.TimeNotAllowed, { type: t(getTranslationKey(entry.type)) });
				return interaction.reply(content);
			}

			if (duration !== 0) {
				const next = entry.createdTimestamp + duration;
				if (next <= Date.now()) {
					const content = t(Root.TimeTooEarly, {
						start: time(seconds.fromMilliseconds(entry.createdTimestamp), TimestampStyles.LongDateTime),
						time: time(seconds.fromMilliseconds(next), TimestampStyles.RelativeTime)
					});
					return interaction.reply(content);
				}
			}
		}

		await moderation.fetchChannelMessages();
		await entry.edit({
			reason: isNullish(reason) ? entry.reason : reason,
			duration: isNullish(duration) ? entry.duration : duration || null
		});

		const content = t(Root.EditSuccess, { caseId: entry.caseId });
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}

	public async chatInputRunArchive(interaction: SkyraSubcommand.Interaction) {
		const entry = await this.#getCase(interaction, true);
		await entry.archive();

		const content = getSupportedUserLanguageT(interaction)(Root.ArchiveSuccess, { caseId: entry.caseId });
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}

	public async chatInputRunDelete(interaction: SkyraSubcommand.Interaction) {
		const entry = await this.#getCase(interaction, true);
		await entry.remove();
		getModeration(interaction.guild).delete(entry.caseId);

		const content = getSupportedUserLanguageT(interaction)(Root.DeleteSuccess, { caseId: entry.caseId });
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}

	public async showMessageRun(message: GuildMessage, args: SkyraSubcommand.Args) {
		return send(message, {
			content: args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, {
				command: chatInputApplicationCommandMention(this.name, 'show', this.getGlobalCommandId())
			})
		});
	}

	public async deleteMessageRun(message: GuildMessage, args: SkyraCommand.Args) {
		return send(message, {
			content: args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, {
				command: chatInputApplicationCommandMention(this.name, 'delete', this.getGlobalCommandId())
			})
		});
	}

	async #listDetails(interaction: SkyraSubcommand.Interaction, t: TFunction, entries: Collection<number, ModerationEntity>, show: boolean) {
		await interaction.deferReply({ ephemeral: !show });

		const usernames = await this.#fetchModeratorsNames(entries);
		const now = Date.now();

		const display = new PaginatedMessageEmbedFields({
			template: new EmbedBuilder() //
				.setTitle(t(LanguageKeys.Commands.Moderation.ModerationsAmount, { count: entries.size }))
				.setColor(interaction.member?.displayColor ?? BrandingColors.Primary)
		});
		display.setIdle(minutes(5));
		display.setItemsPerPage(10);
		display.setItems(entries.map((entry) => this.#listDetailsEntry(entry, usernames, now)));
		await display.run(interaction, interaction.user);
	}

	#listDetailsEntry(entry: ModerationEntity, usernames: Collection<string, string>, now: number): EmbedField {
		const remainingTime = this.#listDetailsEntryRemainingTime(entry, now);
		const expiredTime = remainingTime === 0;
		const formattedModerator = usernames.get(entry.moderatorId);
		const formattedReason = isNullishOrEmpty(entry.reason) ? '-' : cutText(entry.reason, 150);
		const formattedDuration = this.#listDetailsEntryRemainingDuration(remainingTime, now);
		const formatter = expiredTime ? '~~' : '';

		return {
			name: `${inlineCode(entry.caseId.toString())} → ${entry.title}`,
			value: `${formatter}Moderator: **${formattedModerator}**.\n${formattedReason}${formattedDuration}${formatter}`,
			inline: false
		};
	}

	#listDetailsEntryRemainingTime(entry: ModerationEntity, now: number) {
		return entry.archived || isNullishOrZero(entry.duration) || isNullish(entry.createdAt)
			? 0
			: Math.max(0, entry.createdTimestamp + entry.duration! - now);
	}

	#listDetailsEntryRemainingDuration(remainingTime: number, now: number) {
		return remainingTime === 0 ? '' : `\nExpires: ${time(seconds.fromMilliseconds(now + remainingTime), TimestampStyles.RelativeTime)}`;
	}

	async #listOverview(
		interaction: SkyraSubcommand.Interaction,
		t: TFunction,
		entries: Collection<number, ModerationEntity>,
		user: User | null,
		show: boolean
	) {
		let [warnings, mutes, kicks, bans] = [0, 0, 0, 0];
		for (const entry of entries.values()) {
			if (entry.archived || entry.appealType) continue;
			switch (entry.type) {
				case TypeVariation.Ban:
				case TypeVariation.Softban:
					++bans;
					break;
				case TypeVariation.Mute:
					++mutes;
					break;
				case TypeVariation.Kick:
					++kicks;
					break;
				case TypeVariation.Warning:
					++warnings;
					break;
				default:
					break;
			}
		}

		const footer = t(LanguageKeys.Commands.Moderation.HistoryFooterNew, {
			warnings,
			mutes,
			kicks,
			bans,
			warningsText: t(LanguageKeys.Commands.Moderation.HistoryFooterWarning, { count: warnings }),
			mutesText: t(LanguageKeys.Commands.Moderation.HistoryFooterMutes, { count: mutes }),
			kicksText: t(LanguageKeys.Commands.Moderation.HistoryFooterKicks, { count: kicks }),
			bansText: t(LanguageKeys.Commands.Moderation.HistoryFooterBans, { count: bans })
		});

		const embed = new EmbedBuilder()
			.setColor(OverviewColors[Math.min(OverviewColors.length - 1, warnings + mutes + kicks + bans)])
			.setFooter({ text: footer });
		if (user) embed.setAuthor(getFullEmbedAuthor(user));
		await interaction.reply({ embeds: [embed], flags: show ? undefined : MessageFlags.Ephemeral });
	}

	async #fetchModeratorsNames(entries: Collection<number, ModerationEntity>) {
		const moderators = new Collection<string, string>();
		const promises = new Collection<string, Promise<unknown>>();

		for (const entry of entries.values()) {
			if (moderators.has(entry.moderatorId)) continue;
			promises.set(
				entry.moderatorId,
				entry.fetchModerator().then((user) => moderators.set(entry.moderatorId, user.username))
			);
		}
		await Promise.all(promises);
		return moderators;
	}

	#getDuration(interaction: SkyraSubcommand.Interaction, required: true): number;
	#getDuration(interaction: SkyraSubcommand.Interaction, required?: false): number | null;
	#getDuration(interaction: SkyraSubcommand.Interaction, required?: boolean) {
		const parameter = interaction.options.getString('duration', required);
		if (isNullish(parameter)) return null;

		return resolveTimeSpan(parameter, { minimum: 0, maximum: years(1) }) //
			.mapErr((key) => getSupportedUserLanguageT(interaction)(key, { parameter: parameter.toString() }))
			.unwrap();
	}

	async #getCase(interaction: SkyraSubcommand.Interaction, required: true): Promise<ModerationEntity>;
	async #getCase(interaction: SkyraSubcommand.Interaction, required?: false): Promise<ModerationEntity | null>;
	async #getCase(interaction: SkyraSubcommand.Interaction, required?: boolean) {
		const caseId = interaction.options.getInteger('case', required);
		if (isNullish(caseId)) return null;

		const parameter = caseId.toString();
		const t = getSupportedUserLanguageT(interaction);
		return (await resolveCase(parameter, t, interaction.guild)) //
			.mapErr((key) => t(key, { parameter }))
			.unwrap();
	}
}
