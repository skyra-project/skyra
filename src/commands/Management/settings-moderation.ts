import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice } from '@sapphire/plugin-i18next';
import { ChannelType, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

const Root = LanguageKeys.Commands.SettingsModeration;

type Action = 'edit' | 'reset' | 'view';
type Module = 'attachment' | 'uppercase' | 'invite' | 'link' | 'filter' | 'newline' | 'duplicated-messages';

@ApplyOptions<SkyraCommand.Options>({
	description: Root.Description,
	detailedDescription: LanguageKeys.Commands.Shared.SlashOnlyDetailedDescription,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	hidden: true
})
export class UserCommand extends SkyraCommand {
	public override async messageRun() {
		this.error(LanguageKeys.Commands.Shared.SlashOnlyErrorMessage);
	}

	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const action = interaction.options.getSubcommandGroup(true) as Action;
		const module = interaction.options.getSubcommand(true) as Module;

		return interaction.reply({ content: `Action: ${action}, Module: ${module}` });
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		function makeSubcommand(root: string) {
			return (
				applyLocalizedBuilder(new SlashCommandSubcommandBuilder(), root)
					// enabled
					.addBooleanOption((option) => applyLocalizedBuilder(option, Root.EnabledName, Root.EnabledDescription))
					// on-infraction-alert
					.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OnInfractionAlertName, Root.OnInfractionAlertDescription))
					// on-infraction-log
					.addChannelOption((option) =>
						applyLocalizedBuilder(option, Root.OnInfractionLogName, Root.OnInfractionLogDescription).addChannelTypes(
							ChannelType.GuildText,
							ChannelType.GuildAnnouncement,
							ChannelType.AnnouncementThread,
							ChannelType.PublicThread,
							ChannelType.PrivateThread
						)
					)
					// on-infraction-delete
					.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OnInfractionDeleteName, Root.OnInfractionDeleteDescription))
					// on-threshold
					.addStringOption((option) =>
						applyLocalizedBuilder(option, Root.OnThresholdName, Root.OnThresholdDescription).addChoices(
							createLocalizedChoice(Root.PenaltyNone, { value: 'none' }),
							createLocalizedChoice(Root.PenaltyWarning, { value: 'warning' }),
							createLocalizedChoice(Root.PenaltyMute, { value: 'mute' }),
							createLocalizedChoice(Root.PenaltyKick, { value: 'kick' }),
							createLocalizedChoice(Root.PenaltySoftBan, { value: 'softBan' }),
							createLocalizedChoice(Root.PenaltyBan, { value: 'ban' })
						)
					)
					// penalty-duration
					.addStringOption((option) => applyLocalizedBuilder(option, Root.PenaltyDurationName, Root.PenaltyDurationDescription))
					// threshold-maximum
					.addIntegerOption((option) => applyLocalizedBuilder(option, Root.ThresholdMaximumName, Root.ThresholdMaximumDescription))
					// threshold-expiration
					.addStringOption((option) => applyLocalizedBuilder(option, Root.ThresholdExpirationName, Root.ThresholdExpirationDescription))
			);
		}

		function makeResetSubcommand(root: string) {
			return applyLocalizedBuilder(new SlashCommandSubcommandBuilder(), root)
				.addBooleanOption((option) => applyLocalizedBuilder(option, Root.EnabledName, Root.EnabledResetDescription))
				.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OnInfractionAlertName, Root.OnInfractionAlertResetDescription))
				.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OnInfractionLogName, Root.OnInfractionLogResetDescription))
				.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OnInfractionDeleteName, Root.OnInfractionDeleteResetDescription))
				.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OnThresholdName, Root.OnThresholdResetDescription))
				.addBooleanOption((option) => applyLocalizedBuilder(option, Root.PenaltyDurationName, Root.PenaltyDurationResetDescription))
				.addBooleanOption((option) => applyLocalizedBuilder(option, Root.ThresholdMaximumName, Root.ThresholdMaximumResetDescription))
				.addBooleanOption((option) => applyLocalizedBuilder(option, Root.ThresholdExpirationName, Root.ThresholdExpirationResetDescription));
		}

		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, Root.Name, Root.Description) //
				// auto-moderation set
				.addSubcommandGroup((group) =>
					applyLocalizedBuilder(group, Root.Edit)
						.addSubcommand(makeSubcommand(Root.Attachment))
						.addSubcommand(makeSubcommand(Root.Uppercase))
						.addSubcommand(makeSubcommand(Root.Invite))
						.addSubcommand(makeSubcommand(Root.Link))
						.addSubcommand(makeSubcommand(Root.Filter))
						.addSubcommand(makeSubcommand(Root.Newline))
						.addSubcommand(makeSubcommand(Root.DuplicatedMessages))
				)
				// auto-moderation reset
				.addSubcommandGroup((group) =>
					applyLocalizedBuilder(group, Root.Reset)
						.addSubcommand(makeResetSubcommand(Root.Attachment))
						.addSubcommand(makeResetSubcommand(Root.Uppercase))
						.addSubcommand(makeResetSubcommand(Root.Invite))
						.addSubcommand(makeResetSubcommand(Root.Link))
						.addSubcommand(makeResetSubcommand(Root.Filter))
						.addSubcommand(makeResetSubcommand(Root.Newline))
						.addSubcommand(makeResetSubcommand(Root.DuplicatedMessages))
				)
				// auto-moderation view
				.addSubcommandGroup((group) =>
					applyLocalizedBuilder(group, Root.View)
						.addSubcommand((subcommand) => applyLocalizedBuilder(subcommand, Root.Attachment))
						.addSubcommand((subcommand) => applyLocalizedBuilder(subcommand, Root.Uppercase))
						.addSubcommand((subcommand) => applyLocalizedBuilder(subcommand, Root.Invite))
						.addSubcommand((subcommand) => applyLocalizedBuilder(subcommand, Root.Link))
						.addSubcommand((subcommand) => applyLocalizedBuilder(subcommand, Root.Filter))
						.addSubcommand((subcommand) => applyLocalizedBuilder(subcommand, Root.Newline))
						.addSubcommand((subcommand) => applyLocalizedBuilder(subcommand, Root.DuplicatedMessages))
				)
				.setDMPermission(false)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		);
	}
}
