import { GuildEntity, GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { IncomingType, OutgoingType } from '#lib/moderation/workers';
import { SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { remove as removeConfusables } from 'confusables';

@ApplyOptions<SkyraSubcommand.Options>({
	description: LanguageKeys.Commands.Management.FilterDescription,
	detailedDescription: LanguageKeys.Commands.Management.FilterExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'add', messageRun: 'add' },
		{ name: 'remove', messageRun: 'remove' },
		{ name: 'reset', messageRun: 'reset' },
		{ name: 'show', messageRun: 'show', default: true }
	]
})
export class UserCommand extends SkyraSubcommand {
	public async add(message: GuildMessage, args: SkyraSubcommand.Args) {
		const word = await this.getWord(args);
		await writeSettings(message.guild, async (settings) => {
			// Check if the word is not filtered:
			const words = settings[GuildSettings.AutoModeration.Filter.Raw];
			if (await this.hasWord(settings, word)) {
				this.error(LanguageKeys.Commands.Management.FilterAlreadyFiltered);
			}

			// Add the word to the list:
			words.push(word);
		});

		const content = args.t(LanguageKeys.Commands.Management.FilterAdded, { word });
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraSubcommand.Args) {
		const word = await this.getWord(args);
		await writeSettings(message.guild, (settings) => {
			// Check if the word is not filtered:
			const words = settings[GuildSettings.AutoModeration.Filter.Raw];
			const index = words.indexOf(word);
			if (index === -1) {
				this.error(LanguageKeys.Commands.Management.FilterNotFiltered);
			}

			// Remove the word from the list:
			words.splice(index, 1);
		});

		const content = args.t(LanguageKeys.Commands.Management.FilterRemoved, { word });
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraSubcommand.Args) {
		await writeSettings(message.guild, [[GuildSettings.AutoModeration.Filter.Raw, []]]);

		const content = args.t(LanguageKeys.Commands.Management.FilterReset);
		return send(message, content);
	}

	public async show(message: GuildMessage, args: SkyraSubcommand.Args) {
		const raw = await readSettings(message.guild, GuildSettings.AutoModeration.Filter.Raw);

		const content = raw.length
			? args.t(LanguageKeys.Commands.Management.FilterShow, { words: `\`${raw.join('`, `')}\`` })
			: args.t(LanguageKeys.Commands.Management.FilterShowEmpty);
		return send(message, content);
	}

	private async getWord(args: SkyraSubcommand.Args) {
		const word = await args.pick('string', { maximum: 32 });
		return removeConfusables(word.toLowerCase());
	}

	private async hasWord(settings: GuildEntity, content: string) {
		const words = settings[GuildSettings.AutoModeration.Filter.Raw];
		if (words.includes(content)) return true;

		const regExp = settings.wordFilterRegExp;
		if (regExp === null) return false;

		try {
			const result = await this.container.workers.send({ type: IncomingType.RunRegExp, content, regExp });
			return result.type === OutgoingType.RegExpMatch;
		} catch {
			return false;
		}
	}
}
