import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedLanguageT, getSupportedUserLanguageT } from '#lib/i18n/translate';
import { ModerationManager, getAction } from '#lib/moderation';
import { getEmbed, getTitle, getTranslationKey } from '#lib/moderation/common';
import { SkyraCommand, SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { desc, minutes, seconds, years } from '#utils/common';
import { BrandingColors, Emojis } from '#utils/constants';
import { getModeration } from '#utils/functions';
import { TypeVariation } from '#utils/moderationConstants';
import { resolveCase, resolveTimeSpan } from '#utils/resolvers';
import { getFullEmbedAuthor, isUserSelf } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessageEmbedFields } from '@sapphire/discord.js-utilities';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, createLocalizedChoice, type TFunction } from '@sapphire/plugin-i18next';
import { cutText, isNullish, isNullishOrEmpty, isNullishOrZero } from '@sapphire/utilities';
import {
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	TimestampStyles,
	User,
	blockQuote,
	chatInputApplicationCommandMention,
	inlineCode,
	time,
	userMention,
	type EmbedField
} from 'discord.js';

const Root = LanguageKeys.Commands.Case;
const RootModeration = LanguageKeys.Moderation;
const OverviewColors = [0x80f31f, 0xa5de0b, 0xc7c101, 0xe39e03, 0xf6780f, 0xfe5326, 0xfb3244];

@ApplyOptions<SkyraSubcommand.Options>({
	description: Root.Description,
	detailedDescription: LanguageKeys.Commands.Shared.SlashDetailed,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	hidden: true,
	subcommands: [
		{ name: 'view', chatInputRun: 'chatInputRunView', messageRun: 'viewMessageRun', default: true },
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
					applyLocalizedBuilder(subcommand, Root.View) //
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
									createLocalizedChoice(RootModeration.TypeRoleAdd, { value: TypeVariation.RoleAdd }),
									createLocalizedChoice(RootModeration.TypeBan, { value: TypeVariation.Ban }),
									createLocalizedChoice(RootModeration.TypeKick, { value: TypeVariation.Kick }),
									createLocalizedChoice(RootModeration.TypeMute, { value: TypeVariation.Mute }),
									createLocalizedChoice(RootModeration.TypeRoleRemove, { value: TypeVariation.RoleRemove }),
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

	public async chatInputRunView(interaction: SkyraSubcommand.Interaction) {
		const entry = await this.#getCase(interaction, true);
		const show = interaction.options.getBoolean('show') ?? false;
		const t = show ? getSupportedLanguageT(interaction) : getSupportedUserLanguageT(interaction);

		return interaction.reply({ embeds: [await getEmbed(t, entry)], flags: show ? undefined : MessageFlags.Ephemeral });
	}

	public async chatInputRunList(interaction: SkyraSubcommand.Interaction) {
		const user = interaction.options.getUser('user');
		const show = interaction.options.getBoolean('show') ?? false;
		const type = interaction.options.getInteger('type') as TypeVariation | null;

		const moderation = getModeration(interaction.guild);
		let entries = [...(await moderation.fetch({ userId: user?.id })).values()];
		if (!isNullish(type)) entries = entries.filter((entry) => entry.type === type);

		const t = show ? getSupportedLanguageT(interaction) : getSupportedUserLanguageT(interaction);
		return interaction.options.getBoolean('overview') //
			? this.#listOverview(interaction, t, entries, user, show)
			: this.#listDetails(interaction, t, this.#sortEntries(entries), isNullish(user), show);
	}

	public async chatInputRunEdit(interaction: SkyraSubcommand.Interaction) {
		const entry = await this.#getCase(interaction, true);
		const reason = interaction.options.getString('reason');
		const duration = this.#getDuration(interaction);

		const moderation = getModeration(interaction.guild);
		const t = getSupportedUserLanguageT(interaction);
		if (!isNullish(duration)) {
			const action = getAction(entry.type);
			if (!action.isUndoActionAvailable) {
				const content = t(Root.TimeNotAllowed, { type: t(getTranslationKey(entry.type)) });
				return interaction.reply({ content, flags: MessageFlags.Ephemeral });
			}

			if (entry.isCompleted()) {
				const content = t(Root.TimeNotAllowedInCompletedEntries, { caseId: entry.id });
				return interaction.reply({ content, flags: MessageFlags.Ephemeral });
			}

			if (duration !== 0) {
				const next = entry.createdAt + duration;
				if (next <= Date.now()) {
					const content = t(Root.TimeTooEarly, {
						start: time(seconds.fromMilliseconds(entry.createdAt), TimestampStyles.LongDateTime),
						time: time(seconds.fromMilliseconds(next), TimestampStyles.RelativeTime)
					});
					return interaction.reply({ content, flags: MessageFlags.Ephemeral });
				}
			}
		}

		await moderation.edit(entry, {
			reason: isNullish(reason) ? entry.reason : reason,
			duration: isNullish(duration) ? entry.duration : duration || null
		});

		const content = t(Root.EditSuccess, { caseId: entry.id });
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}

	public async chatInputRunArchive(interaction: SkyraSubcommand.Interaction) {
		const entry = await this.#getCase(interaction, true);
		await getModeration(interaction.guild).archive(entry);

		const content = getSupportedUserLanguageT(interaction)(Root.ArchiveSuccess, { caseId: entry.id });
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}

	public async chatInputRunDelete(interaction: SkyraSubcommand.Interaction) {
		const entry = await this.#getCase(interaction, true);
		await getModeration(interaction.guild).delete(entry);

		const content = getSupportedUserLanguageT(interaction)(Root.DeleteSuccess, { caseId: entry.id });
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}

	public async viewMessageRun(message: GuildMessage, args: SkyraSubcommand.Args) {
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

	async #listDetails(
		interaction: SkyraSubcommand.Interaction,
		t: TFunction,
		entries: ModerationManager.Entry[],
		displayUser: boolean,
		show: boolean
	) {
		if (entries.length === 0) {
			const content = getSupportedUserLanguageT(interaction)(Root.ListEmpty);
			return interaction.reply({ content, flags: MessageFlags.Ephemeral });
		}

		await interaction.deferReply({ ephemeral: !show });

		const title = t(Root.ListDetailsTitle, { count: entries.length });
		const color = interaction.member?.displayColor ?? BrandingColors.Primary;
		return new PaginatedMessageEmbedFields()
			.setTemplate(new EmbedBuilder().setTitle(title).setColor(color))
			.setIdle(minutes(5))
			.setItemsPerPage(5)
			.setItems(entries.map((entry) => this.#listDetailsEntry(t, entry, displayUser)))
			.make()
			.run(interaction, interaction.user);
	}

	#listDetailsEntry(t: TFunction, entry: ModerationManager.Entry, displayUser: boolean): EmbedField {
		const moderatorEmoji = isUserSelf(entry.moderatorId) ? Emojis.AutoModerator : Emojis.Moderator;
		const lines = [
			`${Emojis.Calendar} ${time(seconds.fromMilliseconds(entry.createdAt), TimestampStyles.ShortDateTime)}`,
			t(Root.ListDetailsModerator, { emoji: moderatorEmoji, mention: userMention(entry.moderatorId), userId: entry.moderatorId })
		];
		if (displayUser && entry.userId) {
			lines.push(t(Root.ListDetailsUser, { emoji: Emojis.ShieldMember, mention: userMention(entry.userId), userId: entry.userId }));
		}

		if (!isNullishOrZero(entry.duration) && !entry.expired) {
			const timestamp = time(seconds.fromMilliseconds(entry.expiresTimestamp!), TimestampStyles.RelativeTime);
			lines.push(t(Root.ListDetailsExpires, { emoji: Emojis.SandsOfTime, time: timestamp }));
		}

		if (!isNullishOrEmpty(entry.reason)) lines.push(blockQuote(cutText(entry.reason, 150)));

		return {
			name: `${inlineCode(entry.id.toString())} → ${getTitle(t, entry)}`,
			value: lines.join('\n'),
			inline: false
		};
	}

	async #listOverview(
		interaction: SkyraSubcommand.Interaction,
		t: TFunction,
		entries: ModerationManager.Entry[],
		user: User | null,
		show: boolean
	) {
		let [warnings, mutes, timeouts, kicks, bans] = [0, 0, 0, 0, 0];
		for (const entry of entries) {
			if (entry.isArchived() || entry.isUndo()) continue;
			switch (entry.type) {
				case TypeVariation.Ban:
				case TypeVariation.Softban:
					++bans;
					break;
				case TypeVariation.Mute:
					++mutes;
					break;
				case TypeVariation.Timeout:
					++timeouts;
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

		const footer = t(user ? Root.ListOverviewFooterUser : Root.ListOverviewFooter, {
			warnings: t(Root.ListOverviewFooterWarning, { count: warnings }),
			mutes: t(Root.ListOverviewFooterMutes, { count: mutes }),
			timeouts: t(Root.ListOverviewFooterTimeouts, { count: timeouts }),
			kicks: t(Root.ListOverviewFooterKicks, { count: kicks }),
			bans: t(Root.ListOverviewFooterBans, { count: bans })
		});

		const embed = new EmbedBuilder()
			.setColor(OverviewColors[Math.min(OverviewColors.length - 1, warnings + mutes + kicks + bans)])
			.setFooter({ text: footer });
		if (user) embed.setAuthor(getFullEmbedAuthor(user));
		await interaction.reply({ embeds: [embed], flags: show ? undefined : MessageFlags.Ephemeral });
	}

	#sortEntries(entries: ModerationManager.Entry[]) {
		return entries.sort((a, b) => desc(a.id, b.id));
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

	async #getCase(interaction: SkyraSubcommand.Interaction, required: true): Promise<ModerationManager.Entry>;
	async #getCase(interaction: SkyraSubcommand.Interaction, required?: false): Promise<ModerationManager.Entry | null>;
	async #getCase(interaction: SkyraSubcommand.Interaction, required?: boolean) {
		const caseId = interaction.options.getInteger('case', required);
		if (isNullish(caseId)) return null;

		const parameter = caseId.toString();
		const t = getSupportedUserLanguageT(interaction);
		return (await resolveCase(parameter, t, interaction.guild)).unwrap();
	}
}
