import { ConnectFourBotController } from '#lib/games/connect-four/ConnectFourBotController';
import { ConnectFourGame } from '#lib/games/connect-four/ConnectFourGame';
import { ConnectFourHumanController } from '#lib/games/connect-four/ConnectFourHumanController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CLIENT_ID } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { User } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['connect-four'],
	cooldown: 0,
	description: LanguageKeys.Commands.Games.C4Description,
	extendedHelp: LanguageKeys.Commands.Games.C4Extended,
	permissions: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	private readonly channels: Set<string> = new Set();

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		if (this.channels.has(message.channel.id)) this.error(LanguageKeys.Commands.Games.GamesProgress);

		const user = await args.pick('userName');
		const player1 = this.getAuthorController(message);
		const player2 = await this.getTargetController(message, args.t, user);

		this.channels.add(message.channel.id);
		const game = new ConnectFourGame(message, player1, player2);

		try {
			await game.run();
		} finally {
			this.channels.delete(message.channel.id);
		}
	}

	private getAuthorController(message: GuildMessage) {
		return new ConnectFourHumanController(message.author.username, message.author.id);
	}

	private async getTargetController(message: GuildMessage, t: TFunction, user: User) {
		if (user.id === CLIENT_ID) return new ConnectFourBotController();
		if (user.bot) this.error(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) this.error(LanguageKeys.Commands.Games.GamesSelf);

		const response = await message.ask(
			t(LanguageKeys.Commands.Games.TicTacToePrompt, {
				challenger: message.author.toString(),
				challengee: user.toString()
			}),
			undefined,
			{ target: user }
		);

		if (response) return new ConnectFourHumanController(user.username, user.id);
		this.error(LanguageKeys.Commands.Games.GamesPromptDeny);
	}
}
