import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	bucket: 2,
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.Management.FilterDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.FilterExtended),
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
			if (arg) return arg.toLowerCase();
			throw await message.fetchLocale(LanguageKeys.Commands.Management.FilterUndefinedWord);
		}
	]
])
export default class extends SkyraCommand {
	public async add(message: GuildMessage, [word]: [string]) {
		const language = await message.guild.writeSettings((settings) => {
			const language = settings.getLanguage();

			// Check if the word is not filtered:
			const words = settings[GuildSettings.Selfmod.Filter.Raw];
			const { regexp } = message.guild.security;
			if (words.includes(word) || (regexp && regexp.test(word))) {
				throw language.get(LanguageKeys.Commands.Management.FilterAlreadyFiltered);
			}

			// Add the word to the list:
			words.push(word);

			// Return language for re-use:
			return language;
		});

		return message.send(language.get(LanguageKeys.Commands.Management.FilterAdded, { word }));
	}

	public async remove(message: GuildMessage, [word]: [string]) {
		const language = await message.guild.writeSettings((settings) => {
			const language = settings.getLanguage();

			// Check if the word is already filtered:
			const words = settings[GuildSettings.Selfmod.Filter.Raw];
			const index = words.indexOf(word);
			if (index === -1) {
				throw language.get(LanguageKeys.Commands.Management.FilterNotFiltered);
			}

			// Remove the word from the list:
			words.splice(index, 1);

			// Return language for re-use:
			return language;
		});

		return message.send(language.get(LanguageKeys.Commands.Management.FilterRemoved, { word }));
	}

	public async reset(message: GuildMessage) {
		const language = await message.guild.writeSettings((settings) => {
			const language = settings.getLanguage();

			// Set an empty array:
			settings[GuildSettings.Selfmod.Filter.Raw] = [];

			// Return language for re-use:
			return language;
		});

		return message.send(language.get(LanguageKeys.Commands.Management.FilterReset));
	}

	public async show(message: GuildMessage) {
		const raw = await message.guild.readSettings(GuildSettings.Selfmod.Filter.Raw);
		return raw.length
			? message.sendLocale(LanguageKeys.Commands.Management.FilterShow, [{ words: `\`${raw.join('`, `')}\`` }])
			: message.sendLocale(LanguageKeys.Commands.Management.FilterShowEmpty);
	}
}
