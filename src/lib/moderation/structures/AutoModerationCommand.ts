import {
	getConfigurableKeys,
	readSettings,
	readSettingsAdder,
	writeSettings,
	type AdderKey,
	type GuildData,
	type GuildDataValue,
	type GuildSettingsOfType,
	type ReadonlyGuildData,
	type SchemaDataKey
} from '#lib/database';
import type { Adder } from '#lib/database/utils/Adder';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { AutoModerationOnInfraction, AutoModerationPunishment } from '#lib/moderation/structures/AutoModerationOnInfraction';
import { SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage, type TypedT } from '#lib/types';
import { Colors, Emojis } from '#utils/constants';
import { resolveTimeSpan } from '#utils/resolvers';
import { EmbedBuilder, type SlashCommandBuilder, type SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandOptionsRunTypeEnum, type ApplicationCommandRegistry } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, createLocalizedChoice, type TFunction } from '@sapphire/plugin-i18next';
import { isNullish, isNullishOrEmpty, isNullishOrZero, type Awaitable } from '@sapphire/utilities';
import { InteractionContextType, PermissionFlagsBits, chatInputApplicationCommandMention, strikethrough, type Guild } from 'discord.js';

const Root = LanguageKeys.Commands.AutoModeration;
const RootModeration = LanguageKeys.Moderation;

export abstract class AutoModerationCommand extends SkyraSubcommand {
	protected readonly resetKeys: readonly AutoModerationCommand.OptionsResetKey[];
	protected readonly adderPropertyName: AdderKey;
	protected readonly keyEnabled: GuildSettingsOfType<boolean>;
	protected readonly keyOnInfraction: GuildSettingsOfType<number>;
	protected readonly keyPunishment: GuildSettingsOfType<number | null>;
	protected readonly keyPunishmentDuration: GuildSettingsOfType<bigint | number | null>;
	protected readonly keyPunishmentThreshold: GuildSettingsOfType<number | null>;
	protected readonly keyPunishmentThresholdPeriod: GuildSettingsOfType<number | null>;

	readonly #localizedNameKey: TypedT;

	readonly #punishmentDurationMinimum: number;
	readonly #punishmentDurationMaximum: number;
	readonly #punishmentThresholdMinimum: number;
	readonly #punishmentThresholdMaximum: number;
	readonly #punishmentThresholdDurationMinimum: number;
	readonly #punishmentThresholdDurationMaximum: number;
	readonly #idHints: string[];

	protected constructor(context: AutoModerationCommand.LoaderContext, options: AutoModerationCommand.Options) {
		super(context, {
			detailedDescription: LanguageKeys.Commands.Shared.SlashOnlyDetailedDescription,
			permissionLevel: PermissionLevels.Administrator,
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
			hidden: true,
			...options,
			subcommands: [
				{ name: 'show', chatInputRun: 'chatInputRunShow', messageRun: 'messageRunShow', default: true },
				{ name: 'edit', chatInputRun: 'chatInputRunEdit', messageRun: 'messageRunEdit' },
				{ name: 'reset', chatInputRun: 'chatInputRunReset', messageRun: 'messageRunReset' },
				...(options.subcommands ?? [])
			]
		});

		this.resetKeys = options.resetKeys ?? [];
		this.adderPropertyName = options.adderPropertyName;
		this.keyEnabled = options.keyEnabled;
		this.keyOnInfraction = options.keyOnInfraction;
		this.keyPunishment = options.keyPunishment;
		this.keyPunishmentDuration = options.keyPunishmentDuration;
		this.keyPunishmentThreshold = options.keyPunishmentThreshold;
		this.keyPunishmentThresholdPeriod = options.keyPunishmentThresholdPeriod;
		this.#idHints = options.idHints ?? [];

		this.#localizedNameKey = options.localizedNameKey;

		const configurableKeys = getConfigurableKeys();
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
		registry.registerChatInputCommand(
			(builder) =>
				this.registerSubcommands(
					builder //
						.setContexts(InteractionContextType.Guild)
						.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
				),
			{
				idHints: this.#idHints
			}
		);
	}

	/** @deprecated */
	public messageRunShow(message: GuildMessage, args: SkyraSubcommand.Args) {
		const command = chatInputApplicationCommandMention(this.name, 'show', this.getGlobalCommandId());
		return send(message, args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, { command }));
	}

	/** @deprecated */
	public messageRunEdit(message: GuildMessage, args: SkyraSubcommand.Args) {
		const command = chatInputApplicationCommandMention(this.name, 'edit', this.getGlobalCommandId());
		return send(message, args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, { command }));
	}

	/** @deprecated */
	public messageRunReset(message: GuildMessage, args: SkyraSubcommand.Args) {
		const command = chatInputApplicationCommandMention(this.name, 'reset', this.getGlobalCommandId());
		return send(message, args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, { command }));
	}

	public async chatInputRunShow(interaction: AutoModerationCommand.Interaction) {
		const settings = await readSettings(interaction.guild);

		const t = getSupportedUserLanguageT(interaction);
		const embed = settings[this.keyEnabled] //
			? this.showEnabled(t, settings)
			: this.showDisabled(t);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	public async chatInputRunEdit(interaction: AutoModerationCommand.Interaction) {
		const settings = await readSettings(interaction.guild);

		const valueEnabled = interaction.options.getBoolean('enabled');
		const valueOnInfraction = this.#getInfraction(interaction, settings[this.keyOnInfraction]);
		const valuePunishment = interaction.options.getInteger('punishment');
		const valuePunishmentDuration = this.#getDuration(
			interaction,
			'punishment-duration',
			this.#punishmentDurationMinimum,
			this.#punishmentDurationMaximum
		);
		const valuePunishmentThreshold = interaction.options.getInteger('threshold');
		const valuePunishmentThresholdDuration = this.#getDuration(
			interaction,
			'threshold-period',
			this.#punishmentThresholdDurationMinimum,
			this.#punishmentThresholdDurationMaximum
		);

		const pairs: [SchemaDataKey, GuildDataValue][] = [];
		if (!isNullish(valueEnabled)) pairs.push([this.keyEnabled, valueEnabled]);
		if (!isNullish(valueOnInfraction)) pairs.push([this.keyOnInfraction, valueOnInfraction]);
		if (!isNullish(valuePunishment)) pairs.push([this.keyPunishment, valuePunishment]);
		if (!isNullish(valuePunishmentDuration)) pairs.push([this.keyPunishmentDuration, valuePunishmentDuration]);
		if (!isNullish(valuePunishmentThreshold)) pairs.push([this.keyPunishmentThreshold, valuePunishmentThreshold]);
		if (!isNullish(valuePunishmentThresholdDuration)) pairs.push([this.keyPunishmentThresholdPeriod, valuePunishmentThresholdDuration]);

		await writeSettings(interaction.guild, Object.fromEntries(pairs));

		const t = getSupportedUserLanguageT(interaction);
		const content = t(Root.EditSuccess);
		return interaction.reply({ content, ephemeral: true });
	}

	public async chatInputRunReset(interaction: AutoModerationCommand.Interaction) {
		const [key, value] = await this.resetGetKeyValuePair(interaction.guild, interaction.options.getString('key', true) as ResetKey);
		await writeSettings(interaction.guild, { [key]: value });

		const t = getSupportedUserLanguageT(interaction);
		const content = t(Root.EditSuccess);
		return interaction.reply({ content, ephemeral: true });
	}

	protected async resetGetKeyValuePair(guild: Guild, key: ResetKey): Promise<readonly [SchemaDataKey, GuildDataValue]> {
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
			default:
				return this.resetGetKeyValuePairFallback(guild, key);
		}
	}

	protected resetGetKeyValuePairFallback(guild: Guild, key: string): Awaitable<readonly [SchemaDataKey, GuildDataValue]>;
	protected resetGetKeyValuePairFallback(): never {
		throw new Error('Unreachable');
	}

	protected resetGetValue<const Key extends SchemaDataKey>(key: Key): GuildData[Key] {
		return getConfigurableKeys().get(key)!.default as GuildData[Key];
	}

	protected async resetGetOnInfractionFlags(guild: Guild, bit: number) {
		const settings = await readSettings(guild);
		const bitfield = settings[this.keyOnInfraction];
		return AutoModerationOnInfraction.difference(bitfield, bit);
	}

	protected showDisabled(t: TFunction) {
		return new EmbedBuilder() //
			.setColor(Colors.Red)
			.setTitle(t(Root.ShowDisabled));
	}

	protected showEnabled(t: TFunction, settings: ReadonlyGuildData) {
		const embed = new EmbedBuilder() //
			.setColor(Colors.Green)
			.setTitle(t(Root.ShowEnabled))
			.setDescription(this.showEnabledOnInfraction(t, settings[this.keyOnInfraction]));

		const punishment = settings[this.keyPunishment];
		if (!isNullishOrZero(punishment)) {
			embed.addFields({
				name: t(Root.ShowPunishmentTitle),
				value: this.showEnabledOnPunishment(
					t,
					punishment,
					settings[this.keyPunishmentDuration],
					readSettingsAdder(settings, this.adderPropertyName)
				)
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
		punishmentDuration: bigint | number | null,
		adder: Adder<string> | null
	): string {
		const { key, emoji } = this.showEnabledOnPunishmentNameKey(punishment);
		const name = t(key);
		let line: string;
		if (isNullishOrZero(punishmentDuration)) {
			line = t(Root.ShowPunishment, { name, emoji });
			// Add strikethrough if the punishment is a timeout and the duration is not set:
			if (punishment === AutoModerationPunishment.Timeout) line = strikethrough(line);
		} else {
			line = t(Root.ShowPunishmentTemporary, {
				name,
				emoji,
				duration: t(LanguageKeys.Globals.DurationValue, { value: Number(punishmentDuration) })
			});
		}

		return isNullish(adder) ? line : `${line}\n${this.showEnabledOnPunishmentThreshold(t, adder)}`;
	}

	protected showEnabledOnPunishmentNameKey(punishment: AutoModerationPunishment) {
		switch (punishment) {
			case AutoModerationPunishment.Ban:
				return { key: RootModeration.TypeBan, emoji: Emojis.Ban };
			case AutoModerationPunishment.Kick:
				return { key: RootModeration.TypeKick, emoji: Emojis.Kick };
			case AutoModerationPunishment.Timeout:
				return { key: RootModeration.TypeTimeout, emoji: Emojis.Timeout };
			case AutoModerationPunishment.Mute:
				return { key: RootModeration.TypeMute, emoji: Emojis.Timeout };
			case AutoModerationPunishment.Softban:
				return { key: RootModeration.TypeSoftban, emoji: Emojis.Softban };
			case AutoModerationPunishment.Warning:
				return { key: RootModeration.TypeWarning, emoji: Emojis.Flag };
			case AutoModerationPunishment.None:
				throw new Error('Unreachable');
		}
	}

	protected showEnabledOnPunishmentThreshold(t: TFunction, adder: Adder<string>): string {
		return t(Root.ShowPunishmentThreshold, {
			threshold: adder.maximum,
			period: t(LanguageKeys.Globals.DurationValue, { value: adder.duration }),
			emoji: Emojis.Bucket
		});
	}

	/**
	 * Registers the subcommands to the builder, calling:
	 * - {@linkcode registerShowSubcommand}
	 * - {@linkcode registerEditSubcommand}
	 * - {@linkcode registerResetSubcommand}
	 *
	 * @param builder - The builder to register the subcommands to
	 * @returns The updated builder
	 */
	protected registerSubcommands(builder: SlashCommandBuilder) {
		return applyLocalizedBuilder(builder, this.#localizedNameKey, this.description)
			.addSubcommand((subcommand) => this.registerShowSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerEditSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerResetSubcommand(subcommand));
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
		const choices = [
			createLocalizedChoice(Root.OptionsKeyEnabled, { value: 'enabled' }),
			createLocalizedChoice(Root.OptionsKeyActionAlert, { value: 'alert' }),
			createLocalizedChoice(Root.OptionsKeyActionLog, { value: 'log' }),
			createLocalizedChoice(Root.OptionsKeyActionDelete, { value: 'delete' }),
			createLocalizedChoice(Root.OptionsKeyPunishment, { value: 'punishment' }),
			createLocalizedChoice(Root.OptionsKeyPunishmentDuration, { value: 'punishment-duration' }),
			createLocalizedChoice(Root.OptionsKeyThreshold, { value: 'threshold' }),
			createLocalizedChoice(Root.OptionsKeyThresholdPeriod, { value: 'threshold-duration' })
		];

		for (const { key: name, value } of this.resetKeys) {
			choices.push(createLocalizedChoice(name, { value }));
		}

		return applyLocalizedBuilder(subcommand, Root.Reset).addStringOption((option) =>
			applyLocalizedBuilder(option, Root.OptionsKey)
				.setChoices(...choices)
				.setRequired(true)
		);
	}

	#getInfraction(interaction: AutoModerationCommand.Interaction, existing: number) {
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

	#getDuration(interaction: AutoModerationCommand.Interaction, option: string, minimum: number, maximum: number) {
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
		keyPunishmentDuration: GuildSettingsOfType<bigint | number | null>;
		keyPunishmentThreshold: GuildSettingsOfType<number | null>;
		keyPunishmentThresholdPeriod: GuildSettingsOfType<number | null>;
		resetKeys?: readonly OptionsResetKey[];
		idHints?: string[];
	}

	export interface OptionsResetKey {
		key: TypedT;
		value: string;
	}

	export type Interaction = SkyraSubcommand.Interaction;
}
