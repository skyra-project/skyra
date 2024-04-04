import { configurableKeys, readSettings, writeSettings, type AdderKey, type GuildEntity, type GuildSettingsOfType } from '#lib/database';
import type { Adder } from '#lib/database/utils/Adder';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { AutoModerationOnInfraction, AutoModerationPunishment } from '#lib/moderation/structures/AutoModerationOnInfraction';
import { SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type TypedT } from '#lib/types';
import { Colors, Emojis } from '#utils/constants';
import { resolveTimeSpan } from '#utils/resolvers';
import { EmbedBuilder, type SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice, type TFunction } from '@sapphire/plugin-i18next';
import { isNullish, isNullishOrEmpty, isNullishOrZero } from '@sapphire/utilities';
import { Guild, PermissionFlagsBits } from 'discord.js';

const Root = LanguageKeys.Commands.AutoModeration;
const RootModeration = LanguageKeys.Moderation;

export abstract class AutoModerationCommand extends SkyraSubcommand {
	protected readonly adderPropertyName: AdderKey;
	protected readonly keyEnabled: GuildSettingsOfType<boolean>;
	protected readonly keyOnInfraction: GuildSettingsOfType<number>;
	protected readonly keyPunishment: GuildSettingsOfType<number | null>;
	protected readonly keyPunishmentDuration: GuildSettingsOfType<number | null>;
	protected readonly keyPunishmentThreshold: GuildSettingsOfType<number | null>;
	protected readonly keyPunishmentThresholdPeriod: GuildSettingsOfType<number | null>;

	readonly #localizedNameKey: TypedT;

	readonly #punishmentDurationMinimum: number;
	readonly #punishmentDurationMaximum: number;
	readonly #punishmentThresholdMinimum: number;
	readonly #punishmentThresholdMaximum: number;
	readonly #punishmentThresholdDurationMinimum: number;
	readonly #punishmentThresholdDurationMaximum: number;

	protected constructor(context: SkyraSubcommand.LoaderContext, options: AutoModerationCommand.Options) {
		super(context, {
			detailedDescription: LanguageKeys.Commands.Shared.SlashOnlyDetailedDescription,
			permissionLevel: PermissionLevels.Administrator,
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
			hidden: true,
			subcommands: [
				{ name: 'show', chatInputRun: 'chatInputRunShow', default: true },
				{ name: 'edit', chatInputRun: 'chatInputRunEdit' },
				{ name: 'reset', chatInputRun: 'chatInputRunReset' }
			],
			...options
		});

		this.adderPropertyName = options.adderPropertyName;
		this.keyEnabled = options.keyEnabled;
		this.keyOnInfraction = options.keyOnInfraction;
		this.keyPunishment = options.keyPunishment;
		this.keyPunishmentDuration = options.keyPunishmentDuration;
		this.keyPunishmentThreshold = options.keyPunishmentThreshold;
		this.keyPunishmentThresholdPeriod = options.keyPunishmentThresholdPeriod;

		this.#localizedNameKey = options.localizedNameKey;

		const punishmentDuration = configurableKeys.get(this.keyPunishmentDuration)!;
		this.#punishmentDurationMinimum = punishmentDuration.minimum!;
		this.#punishmentDurationMaximum = punishmentDuration.maximum!;

		const punishmentThreshold = configurableKeys.get(this.keyPunishmentThresholdPeriod)!;
		this.#punishmentThresholdMinimum = punishmentThreshold.minimum!;
		this.#punishmentThresholdMaximum = punishmentThreshold.maximum!;

		const punishmentThresholdDuration = configurableKeys.get(this.keyPunishmentThresholdPeriod)!;
		this.#punishmentThresholdDurationMinimum = punishmentThresholdDuration.minimum!;
		this.#punishmentThresholdDurationMaximum = punishmentThresholdDuration.maximum!;
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, this.#localizedNameKey, this.description)
				.setDMPermission(false)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
				.addSubcommand((subcommand) => this.registerShowSubcommand(subcommand))
				.addSubcommand((subcommand) => this.registerEditSubcommand(subcommand))
				.addSubcommand((subcommand) => this.registerResetSubcommand(subcommand))
		);
	}

	public async chatInputRunShow(interaction: SkyraSubcommand.Interaction) {
		const [enabled, onInfraction, punishment, punishmentDuration, adder] = await readSettings(interaction.guild, (settings) => [
			settings[this.keyEnabled],
			settings[this.keyOnInfraction],
			settings[this.keyPunishment],
			settings[this.keyPunishmentDuration],
			settings.adders[this.adderPropertyName]
		]);

		const t = getSupportedUserLanguageT(interaction);
		const embed = enabled //
			? this.showEnabled(t, onInfraction, punishment, punishmentDuration, adder)
			: this.showDisabled(t);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	public async chatInputRunEdit(interaction: SkyraSubcommand.Interaction) {
		const valueEnabled = interaction.options.getBoolean('enabled');
		const valueOnInfraction = this.#getInfraction(interaction, await readSettings(interaction.guild, this.keyOnInfraction));
		const valuePunishment = interaction.options.getInteger('punishment');
		const valuePunishmentDuration = this.#getDuration(
			interaction,
			'punishment-duration',
			this.#punishmentDurationMinimum,
			this.#punishmentDurationMaximum
		);
		const valuePunishmentThreshold = interaction.options.getInteger('threshold-maximum');
		const valuePunishmentThresholdDuration = this.#getDuration(
			interaction,
			'threshold-duration',
			this.#punishmentThresholdDurationMinimum,
			this.#punishmentThresholdDurationMaximum
		);

		const pairs: [keyof GuildEntity, GuildEntity[keyof GuildEntity]][] = [];
		if (!isNullish(valueEnabled)) pairs.push([this.keyEnabled, valueEnabled]);
		if (!isNullish(valueOnInfraction)) pairs.push([this.keyOnInfraction, valueOnInfraction]);
		if (!isNullish(valuePunishment)) pairs.push([this.keyPunishment, valuePunishment]);
		if (!isNullish(valuePunishmentDuration)) pairs.push([this.keyPunishmentDuration, valuePunishmentDuration]);
		if (!isNullish(valuePunishmentThreshold)) pairs.push([this.keyPunishmentThreshold, valuePunishmentThreshold]);
		if (!isNullish(valuePunishmentThresholdDuration)) pairs.push([this.keyPunishmentThresholdPeriod, valuePunishmentThresholdDuration]);

		await writeSettings(interaction.guild, pairs);

		const t = getSupportedUserLanguageT(interaction);
		const content = t(Root.EditSuccess);
		return interaction.reply({ content, ephemeral: true });
	}

	public async chatInputRunReset(interaction: SkyraSubcommand.Interaction) {
		const [key, value] = await this.resetGetKeyValuePair(interaction.guild, interaction.options.getString('key', true) as ResetKey);
		await writeSettings(interaction.guild, [[key, value]]);

		const t = getSupportedUserLanguageT(interaction);
		const content = t(Root.EditSuccess);
		return interaction.reply({ content, ephemeral: true });
	}

	protected async resetGetKeyValuePair(guild: Guild, key: ResetKey): Promise<[keyof GuildEntity, GuildEntity[keyof GuildEntity]]> {
		switch (key) {
			case 'enabled':
				return [this.keyEnabled, false];
			case 'alert':
				return [this.keyOnInfraction, await this.resetGetOnInfractionFlags(guild, AutoModerationOnInfraction.flags.Alert)];
			case 'log':
				return [this.keyOnInfraction, await this.resetGetOnInfractionFlags(guild, AutoModerationOnInfraction.flags.Log)];
			case 'delete':
				return [this.keyOnInfraction, await this.resetGetOnInfractionFlags(guild, AutoModerationOnInfraction.flags.Delete)];
			case 'punishment':
				return [this.keyPunishment, this.resetGetValue(this.keyPunishment)];
			case 'punishment-duration':
				return [this.keyPunishmentDuration, this.resetGetValue(this.keyPunishmentDuration)];
			case 'threshold':
				return [this.keyPunishmentThreshold, this.resetGetValue(this.keyPunishmentThreshold)];
			case 'threshold-duration':
				return [this.keyPunishmentThresholdPeriod, this.resetGetValue(this.keyPunishmentThresholdPeriod)];
		}
	}

	protected resetGetValue<const Key extends keyof GuildEntity>(key: Key): GuildEntity[Key] {
		return configurableKeys.get(key)!.default as GuildEntity[Key];
	}

	protected async resetGetOnInfractionFlags(guild: Guild, bit: number) {
		const bitfield = await readSettings(guild, this.keyOnInfraction);
		return AutoModerationOnInfraction.difference(bitfield, bit);
	}

	protected showDisabled(t: TFunction) {
		return new EmbedBuilder() //
			.setColor(Colors.Red)
			.setTitle(t(Root.ShowDisabled));
	}

	protected showEnabled(
		t: TFunction,
		onInfraction: number,
		punishment: AutoModerationPunishment | null,
		punishmentDuration: number | null,
		adder: Adder<string> | null
	) {
		const embed = new EmbedBuilder() //
			.setColor(Colors.Green)
			.setTitle(t(Root.ShowEnabled))
			.setDescription(this.showEnabledOnInfraction(t, onInfraction));

		if (!isNullishOrZero(punishment)) {
			embed.addFields({
				name: t(Root.ShowPunishmentTitle),
				value: this.showEnabledOnPunishment(t, punishment, punishmentDuration, adder)
			});
		}

		return embed;
	}

	protected showEnabledOnInfraction(t: TFunction, value: number) {
		const replyLine = AutoModerationOnInfraction.has(value, AutoModerationOnInfraction.flags.Alert)
			? t(Root.ShowReplyActive, { emoji: Emojis.Reply })
			: t(Root.ShowReplyInactive, { emoji: Emojis.ReplyInactive });
		const logLine = AutoModerationOnInfraction.has(value, AutoModerationOnInfraction.flags.Log)
			? t(Root.ShowLogActive, { emoji: Emojis.Flag })
			: t(Root.ShowLogInactive, { emoji: Emojis.FlagInactive });
		const deleteLine = AutoModerationOnInfraction.has(value, AutoModerationOnInfraction.flags.Delete)
			? t(Root.ShowDeleteActive, { emoji: Emojis.Delete })
			: t(Root.ShowDeleteInactive, { emoji: Emojis.DeleteInactive });

		return `${replyLine}\n${logLine}\n${deleteLine}`;
	}

	protected showEnabledOnPunishment(
		t: TFunction,
		punishment: AutoModerationPunishment,
		punishmentDuration: number | null,
		adder: Adder<string> | null
	): string {
		const name = t(this.showEnabledOnPunishmentNameKey(punishment));
		const line = isNullishOrZero(punishmentDuration) //
			? t(Root.ShowPunishment, { name })
			: t(Root.ShowPunishmentTemporary, { name, duration: t(LanguageKeys.Globals.DurationValue, { value: punishmentDuration }) });

		return isNullish(adder) ? line : `${line}\n${this.showEnabledOnPunishmentThreshold(t, adder)}`;
	}

	protected showEnabledOnPunishmentNameKey(punishment: AutoModerationPunishment) {
		switch (punishment) {
			case AutoModerationPunishment.Ban:
				return RootModeration.TypeBan;
			case AutoModerationPunishment.Kick:
				return RootModeration.TypeKick;
			case AutoModerationPunishment.Timeout:
				return RootModeration.TypeTimeout;
			case AutoModerationPunishment.Mute:
				return RootModeration.TypeMute;
			case AutoModerationPunishment.Softban:
				return RootModeration.TypeSoftban;
			case AutoModerationPunishment.Warning:
				return RootModeration.TypeWarning;
			case AutoModerationPunishment.None:
				throw new Error('Unreachable');
		}
	}

	protected showEnabledOnPunishmentThreshold(t: TFunction, adder: Adder<string>): string {
		return `${this.showEnabledOnPunishmentThresholdMaximum(t, adder.maximum)}\n${this.showEnabledOnPunishmentThresholdPeriod(t, adder.duration)}`;
	}

	protected showEnabledOnPunishmentThresholdMaximum(t: TFunction, maximum: number): string {
		return isNullishOrZero(maximum) //
			? t(Root.ShowPunishmentThresholdMaximumUnset)
			: t(Root.ShowPunishmentThresholdMaximum, { maximum });
	}

	protected showEnabledOnPunishmentThresholdPeriod(t: TFunction, duration: number): string {
		return isNullishOrZero(duration) //
			? t(Root.ShowPunishmentThresholdPeriodUnset)
			: t(Root.ShowPunishmentThresholdPeriod, { duration: t(LanguageKeys.Globals.DurationValue, { value: duration }) });
	}

	protected registerShowSubcommand(subcommand: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(subcommand, Root.Show);
	}

	protected registerEditSubcommand(subcommand: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(subcommand, Root.Edit) //
			.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsEnabled))
			.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsActionAlert))
			.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsActionLog))
			.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsActionDelete))
			.addIntegerOption((option) =>
				applyLocalizedBuilder(option, Root.OptionsPunishment) //
					.setChoices(
						createLocalizedChoice(RootModeration.TypeWarning, { value: AutoModerationPunishment.Warning }),
						createLocalizedChoice(RootModeration.TypeTimeout, { value: AutoModerationPunishment.Timeout }),
						createLocalizedChoice(RootModeration.TypeMute, { value: AutoModerationPunishment.Mute }),
						createLocalizedChoice(RootModeration.TypeKick, { value: AutoModerationPunishment.Kick }),
						createLocalizedChoice(RootModeration.TypeSoftban, { value: AutoModerationPunishment.Softban }),
						createLocalizedChoice(RootModeration.TypeBan, { value: AutoModerationPunishment.Ban })
					)
			)
			.addStringOption((option) => applyLocalizedBuilder(option, Root.OptionsPunishmentDuration))
			.addIntegerOption((option) =>
				applyLocalizedBuilder(option, Root.OptionsThreshold)
					.setMinValue(this.#punishmentThresholdMinimum)
					.setMaxValue(this.#punishmentThresholdMaximum)
			)
			.addStringOption((option) => applyLocalizedBuilder(option, Root.OptionsThresholdPeriod));
	}

	protected registerResetSubcommand(subcommand: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(subcommand, Root.Reset).addStringOption((option) =>
			applyLocalizedBuilder(option, Root.OptionsKey)
				.setChoices(
					createLocalizedChoice(Root.OptionsKeyEnabled, { value: 'enabled' }),
					createLocalizedChoice(Root.OptionsKeyActionAlert, { value: 'alert' }),
					createLocalizedChoice(Root.OptionsKeyActionLog, { value: 'log' }),
					createLocalizedChoice(Root.OptionsKeyActionDelete, { value: 'delete' }),
					createLocalizedChoice(Root.OptionsKeyPunishment, { value: 'punishment' }),
					createLocalizedChoice(Root.OptionsKeyPunishmentDuration, { value: 'punishment-duration' }),
					createLocalizedChoice(Root.OptionsKeyThreshold, { value: 'threshold' }),
					createLocalizedChoice(Root.OptionsKeyThresholdPeriod, { value: 'threshold-duration' })
				)
				.setRequired(true)
		);
	}

	#getInfraction(interaction: SkyraSubcommand.Interaction, existing: number) {
		const actionAlert = interaction.options.getBoolean('alert');
		const actionLog = interaction.options.getBoolean('log');
		const actionDelete = interaction.options.getBoolean('delete');

		const existingActionAlert = AutoModerationOnInfraction.has(existing, AutoModerationOnInfraction.flags.Alert);
		const existingActionLog = AutoModerationOnInfraction.has(existing, AutoModerationOnInfraction.flags.Log);
		const existingActionDelete = AutoModerationOnInfraction.has(existing, AutoModerationOnInfraction.flags.Delete);

		let bitfield = 0;
		if (actionAlert ?? existingActionAlert) bitfield |= AutoModerationOnInfraction.flags.Alert;
		if (actionLog ?? existingActionLog) bitfield |= AutoModerationOnInfraction.flags.Log;
		if (actionDelete ?? existingActionDelete) bitfield |= AutoModerationOnInfraction.flags.Delete;

		return bitfield;
	}

	#getDuration(interaction: SkyraSubcommand.Interaction, option: string, minimum: number, maximum: number) {
		const parameter = interaction.options.getString(option);
		if (isNullishOrEmpty(parameter)) return null;

		return resolveTimeSpan(parameter, { minimum, maximum }) //
			.mapErr((key) => getSupportedUserLanguageT(interaction)(key, { parameter: parameter.toString() }))
			.unwrapRaw();
	}
}

type ResetKey = 'enabled' | 'alert' | 'log' | 'delete' | 'punishment' | 'punishment-duration' | 'threshold' | 'threshold-duration';

export namespace AutoModerationCommand {
	export type LoaderContext = SkyraSubcommand.LoaderContext;

	/**
	 * The AutoModerationCommand Options
	 */
	export interface Options extends Omit<SkyraSubcommand.Options, 'detailedDescription'> {
		localizedNameKey: TypedT;
		adderPropertyName: AdderKey;
		keyEnabled: GuildSettingsOfType<boolean>;
		keyOnInfraction: GuildSettingsOfType<number>;
		keyPunishment: GuildSettingsOfType<number | null>;
		keyPunishmentDuration: GuildSettingsOfType<number | null>;
		keyPunishmentThreshold: GuildSettingsOfType<number | null>;
		keyPunishmentThresholdPeriod: GuildSettingsOfType<number | null>;
	}

	export type Args = SkyraSubcommand.Args;
}
