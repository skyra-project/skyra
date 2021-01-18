import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolvers } from '@skyra/decorators';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 5,
	description: LanguageKeys.Commands.Management.FilterDescription,
	extendedHelp: LanguageKeys.Commands.Management.FilterExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|reset|show:default> (word:word)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'word',
		async (arg, _, message, [type]) => {
			if (type === 'reset' || type === 'show') return undefined;
			if (!arg) throw await message.resolveKey(LanguageKeys.Commands.Management.FilterUndefinedWord);
			if (arg.length > 32) throw await message.resolveKey(LanguageKeys.Commands.Management.FilterTooLong);
			return arg.toLowerCase();
		}
	]
])
export default class extends SkyraCommand {
	public async add(message: GuildMessage, [word]: [string]) {
		const t = await message.guild.writeSettings((settings) => {
			const t = settings.getLanguage();

			// Check if the word is not filtered:
			const words = settings[GuildSettings.Selfmod.Filter.Raw];
			const regex = settings.wordFilterRegExp;
			if (words.includes(word) || (regex && regex.test(word))) {
				throw t(LanguageKeys.Commands.Management.FilterAlreadyFiltered);
			}

			// Add the word to the list:
			words.push(word);

			// Return language for re-use:
			return t;
		});

		return message.send(t(LanguageKeys.Commands.Management.FilterAdded, { word }));
	}

	public async remove(message: GuildMessage, [word]: [string]) {
		const t = await message.guild.writeSettings((settings) => {
			const t = settings.getLanguage();

			// Check if the word is not filtered:
			const words = settings[GuildSettings.Selfmod.Filter.Raw];
			const index = words.indexOf(word);
			if (index === -1) {
				throw t(LanguageKeys.Commands.Management.FilterNotFiltered);
			}

			// Remove the word from the list:
			words.splice(index, 1);

			// Return language for re-use:
			return t;
		});

		return message.send(t(LanguageKeys.Commands.Management.FilterRemoved, { word }));
	}

	public async reset(message: GuildMessage) {
		const t = await message.guild.writeSettings((settings) => {
			const t = settings.getLanguage();

			// Set an empty array:
			settings[GuildSettings.Selfmod.Filter.Raw].length = 0;

			// Return language for re-use:
			return t;
		});

		return message.send(t(LanguageKeys.Commands.Management.FilterReset));
	}

	public async show(message: GuildMessage) {
		const [raw, t] = await message.guild.readSettings((settings) => [settings[GuildSettings.Selfmod.Filter.Raw], settings.getLanguage()]);
		return raw.length
			? message.send(t(LanguageKeys.Commands.Management.FilterShow, { words: `\`${raw.join('`, `')}\`` }))
			: message.send(t(LanguageKeys.Commands.Management.FilterShowEmpty));
	}
}
