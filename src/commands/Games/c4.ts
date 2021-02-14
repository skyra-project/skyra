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

		if (user.id === CLIENT_ID) this.error(LanguageKeys.Commands.Games.GamesSkyra);
		if (user.bot) this.error(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) this.error(LanguageKeys.Commands.Games.GamesSelf);

		const { client } = this.context;
		if (client.connectFour.has(message.channel.id)) this.error(LanguageKeys.Commands.Games.GamesProgress);
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
				this.error(LanguageKeys.Commands.Games.GamesPromptDeny);
			}
		} catch (error) {
			if (typeof error !== 'string') client.logger.fatal(error);
			this.error(LanguageKeys.Commands.Games.GamesPromptTimeout);
		} finally {
			client.connectFour.delete(message.channel.id);
		}
	}
}
