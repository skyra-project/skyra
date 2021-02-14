import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 5,
	description: LanguageKeys.Commands.Management.FilterDescription,
	extendedHelp: LanguageKeys.Commands.Management.FilterExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const word = (await args.pick('string', { maximum: 32 })).toLowerCase();
		await message.guild.writeSettings((settings) => {
			// Check if the word is not filtered:
			const words = settings[GuildSettings.Selfmod.Filter.Raw];
			const regex = settings.wordFilterRegExp;
			if (words.includes(word) || (regex && regex.test(word))) {
				this.error(LanguageKeys.Commands.Management.FilterAlreadyFiltered);
			}

			// Add the word to the list:
			words.push(word);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.FilterAdded, { word }));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const word = (await args.pick('string', { maximum: 32 })).toLowerCase();
		await message.guild.writeSettings((settings) => {
			// Check if the word is not filtered:
			const words = settings[GuildSettings.Selfmod.Filter.Raw];
			const index = words.indexOf(word);
			if (index === -1) {
				this.error(LanguageKeys.Commands.Management.FilterNotFiltered);
			}

			// Remove the word from the list:
			words.splice(index, 1);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.FilterRemoved, { word }));
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		await message.guild.writeSettings([[GuildSettings.Selfmod.Filter.Raw, []]]);
		return message.send(args.t(LanguageKeys.Commands.Management.FilterReset));
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const raw = await message.guild.readSettings(GuildSettings.Selfmod.Filter.Raw);
		return raw.length
			? message.send(args.t(LanguageKeys.Commands.Management.FilterShow, { words: `\`${raw.join('`, `')}\`` }))
			: message.send(args.t(LanguageKeys.Commands.Management.FilterShowEmpty));
	}
}
