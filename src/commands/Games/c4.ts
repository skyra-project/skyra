import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CLIENT_ID } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['connect-four'],
	cooldown: 0,
	description: LanguageKeys.Commands.Games.C4Description,
	extendedHelp: LanguageKeys.Commands.Games.C4Extended,
	permissions: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');

		if (user.id === CLIENT_ID) throw args.t(LanguageKeys.Commands.Games.GamesSkyra);
		if (user.bot) throw args.t(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) throw args.t(LanguageKeys.Commands.Games.GamesSelf);

		const { client } = this.context;
		if (client.connectFour.has(message.channel.id)) throw args.t(LanguageKeys.Commands.Games.GamesProgress);
		client.connectFour.set(message.channel.id, null);

		try {
			const response = await message.ask(
				args.t(LanguageKeys.Commands.Games.C4Prompt, {
					challenger: message.author.toString(),
					challengee: user.toString()
				}),
				undefined,
				{ target: user }
			);

			if (response) {
				await client.connectFour.create(message, message.author, user)!.run();
			} else {
				await message.alert(args.t(LanguageKeys.Commands.Games.GamesPromptDeny));
			}
		} catch (error) {
			if (typeof error !== 'string') client.logger.fatal(error);
			await message.alert(args.t(LanguageKeys.Commands.Games.GamesPromptTimeout));
		} finally {
			client.connectFour.delete(message.channel.id);
		}
	}
}
