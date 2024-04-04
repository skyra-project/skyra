import { GuildSettings, readSettings, writeSettings, type GuildEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { AutoModerationCommand } from '#lib/moderation';
import { IncomingType, OutgoingType } from '#lib/moderation/workers';
import type { SkyraSubcommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { addAutomaticFields } from '#utils/functions';
import { chatInputApplicationCommandMention, type SlashCommandBuilder, type SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, type TFunction } from '@sapphire/plugin-i18next';
import { isNullishOrEmpty, type Awaitable } from '@sapphire/utilities';
import { remove as removeConfusables } from 'confusables';
import { inlineCode, type Guild } from 'discord.js';

const Root = LanguageKeys.Commands.AutoModeration;
const SettingsRoot = GuildSettings.AutoModeration.Filter;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['filter-mode', 'word-filter-mode', 'manage-filter', 'filter'],
	description: Root.WordsDescription,
	localizedNameKey: Root.WordsName,
	subcommands: [
		{ name: 'add', chatInputRun: 'chatInputRunAdd', messageRun: 'messageRunAdd' },
		{ name: 'remove', chatInputRun: 'chatInputRunRemove', messageRun: 'messageRunRemove' }
	],
	resetKeys: [{ key: Root.OptionsKeyWords, value: 'words' }],
	adderPropertyName: 'words',
	keyEnabled: SettingsRoot.Enabled,
	keyOnInfraction: SettingsRoot.SoftAction,
	keyPunishment: SettingsRoot.HardAction,
	keyPunishmentDuration: SettingsRoot.HardActionDuration,
	keyPunishmentThreshold: SettingsRoot.ThresholdMaximum,
	keyPunishmentThresholdPeriod: SettingsRoot.ThresholdDuration
})
export class UserAutoModerationCommand extends AutoModerationCommand {
	/** @deprecated */
	public messageRunAdd(message: GuildMessage, args: SkyraSubcommand.Args) {
		const command = chatInputApplicationCommandMention(this.name, 'add', this.getGlobalCommandId());
		return send(message, args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, { command }));
	}

	/** @deprecated */
	public messageRunRemove(message: GuildMessage, args: SkyraSubcommand.Args) {
		const command = chatInputApplicationCommandMention(this.name, 'remove', this.getGlobalCommandId());
		return send(message, args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, { command }));
	}

	public async chatInputRunAdd(interaction: AutoModerationCommand.Interaction) {
		const word = this.#getWord(interaction);
		const { guild } = interaction;
		const settings = await readSettings(guild);

		const t = getSupportedUserLanguageT(interaction);
		if (await this.#hasWord(settings, word)) {
			return interaction.reply({ content: t(Root.WordAddFiltered, { word }), ephemeral: true });
		}

		const updated = settings[SettingsRoot.Raw].concat(word);
		await writeSettings(guild, [[SettingsRoot.Raw, updated]]);
		return interaction.reply({ content: t(Root.EditSuccess), ephemeral: true });
	}

	public async chatInputRunRemove(interaction: AutoModerationCommand.Interaction) {
		const word = this.#getWord(interaction);
		const { guild } = interaction;
		const settings = await readSettings(guild);

		const t = getSupportedUserLanguageT(interaction);
		const index = settings[SettingsRoot.Raw].indexOf(word);
		if (index === -1) {
			return interaction.reply({ content: t(Root.WordRemoveNotFiltered, { word }), ephemeral: true });
		}

		const updated = settings[SettingsRoot.Raw].toSpliced(index, 1);
		await writeSettings(guild, [[SettingsRoot.Raw, updated]]);
		return interaction.reply({ content: t(Root.EditSuccess), ephemeral: true });
	}

	protected override showEnabled(t: TFunction, settings: GuildEntity) {
		const embed = super.showEnabled(t, settings);

		const words = settings[SettingsRoot.Raw];
		if (isNullishOrEmpty(words)) {
			const command = chatInputApplicationCommandMention(this.name, 'add', this.getGlobalCommandId());
			embed.addFields({
				name: t(Root.WordShowListTitleEmpty),
				value: t(Root.WordShowListEmpty, { command })
			});
		} else {
			addAutomaticFields(
				embed,
				t(Root.WordShowListTitle, { count: words.length }),
				t(Root.WordShowList, { words: words.map((word) => inlineCode(word)) })
			);
		}
		return embed;
	}

	protected override registerSubcommands(builder: SlashCommandBuilder) {
		return super
			.registerSubcommands(builder)
			.addSubcommand((subcommand) => this.registerAddSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerRemoveSubcommand(subcommand));
	}

	protected registerAddSubcommand(subcommand: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(subcommand, Root.AddName, Root.WordAddDescription) //
			.addStringOption((option) => applyLocalizedBuilder(option, Root.OptionsWord).setRequired(true).setMinLength(2).setMaxLength(32));
	}

	protected registerRemoveSubcommand(subcommand: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(subcommand, Root.RemoveName, Root.WordRemoveDescription) //
			.addStringOption((option) => applyLocalizedBuilder(option, Root.OptionsWord).setRequired(true).setMinLength(2).setMaxLength(32));
	}

	protected override resetGetKeyValuePairFallback(
		guild: Guild,
		key: string
	): Awaitable<readonly [keyof GuildEntity, GuildEntity[keyof GuildEntity]]> {
		if (key === 'words') return [SettingsRoot.Raw, []];
		return super.resetGetKeyValuePairFallback(guild, key);
	}

	#getWord(interaction: AutoModerationCommand.Interaction) {
		return removeConfusables(interaction.options.getString('word', true).toLowerCase());
	}

	async #hasWord(settings: GuildEntity, word: string) {
		const words = settings[SettingsRoot.Raw];
		if (words.includes(word)) return true;

		const regExp = settings.wordFilterRegExp;
		if (regExp === null) return false;

		try {
			const result = await this.container.workers.send({ type: IncomingType.RunRegExp, content: word, regExp });
			return result.type === OutgoingType.RegExpMatch;
		} catch {
			return false;
		}
	}
}
