import { ConnectFourBotController } from '#lib/games/connect-four/ConnectFourBotController';
import { ConnectFourGame } from '#lib/games/connect-four/ConnectFourGame';
import { ConnectFourHumanController } from '#lib/games/connect-four/ConnectFourHumanController';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { promptConfirmation } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { PermissionFlagsBits, type User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['connect-four'],
	description: LanguageKeys.Commands.Games.C4Description,
	detailedDescription: LanguageKeys.Commands.Games.C4Extended,
	flags: ['easy', 'medium', 'hard'],
	requiredClientPermissions: [PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	private readonly channels = new Set<string>();

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
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

		const response = await promptConfirmation(message, {
			content: args.t(LanguageKeys.Commands.Games.C4Prompt, {
				challenger: message.author.toString(),
				challengee: user.toString()
			}),
			target: user
		});

		if (response) return new ConnectFourHumanController(user.username, user.id);
		this.error(LanguageKeys.Commands.Games.GamesPromptDeny);
	}

	private getDifficulty(args: SkyraCommand.Args) {
		if (args.getFlags('hard')) return 7;
		if (args.getFlags('easy')) return 3;
		return 5;
	}
}
