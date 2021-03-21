import { ConnectFourBotController } from '#lib/games/connect-four/ConnectFourBotController';
import { ConnectFourGame } from '#lib/games/connect-four/ConnectFourGame';
import { ConnectFourHumanController } from '#lib/games/connect-four/ConnectFourHumanController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['connect-four'],
	cooldown: 0,
	description: LanguageKeys.Commands.Games.C4Description,
	extendedHelp: LanguageKeys.Commands.Games.C4Extended,
	permissions: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	strategyOptions: { flags: ['easy', 'medium', 'hard'] }
})
export class UserCommand extends SkyraCommand {
	private readonly channels = new Set<string>();

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		if (this.channels.has(message.channel.id)) this.error(LanguageKeys.Commands.Games.GamesProgress);

		const user = await args.pick('userName');
		const player1 = this.getAuthorController(message);
		const player2 = await this.getTargetController(message, user, args);

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

	private async getTargetController(message: GuildMessage, user: User, args: SkyraCommand.Args) {
		if (user.id === process.env.CLIENT_ID) return new ConnectFourBotController(this.getDifficulty(args));
		if (user.bot) this.error(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) this.error(LanguageKeys.Commands.Games.GamesSelf);

		const response = await message.ask(
			args.t(LanguageKeys.Commands.Games.C4Prompt, {
				challenger: message.author.toString(),
				challengee: user.toString()
			}),
			undefined,
			{ target: user }
		);

		if (response) return new ConnectFourHumanController(user.username, user.id);
		this.error(LanguageKeys.Commands.Games.GamesPromptDeny);
	}

	private getDifficulty(args: SkyraCommand.Args) {
		if (args.getFlags('hard')) return 7;
		if (args.getFlags('easy')) return 3;
		return 5;
	}
}
