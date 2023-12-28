import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { minutes, seconds } from '#utils/common';
import { Colors } from '#utils/constants';
import { getTag, random } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { Argument } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.PopDescription,
	detailedDescription: LanguageKeys.Commands.Fun.PopExtended,
	options: ['x', 'width', 'y', 'height', 'l', 'length']
})
export class UserCommand extends SkyraCommand {
	private readonly characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	private get integer(): Argument<number> {
		return this.container.stores.get('arguments').get('integer') as Argument<number>;
	}

	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		const time = args.finished ? seconds(30) : await args.pick('timespan', { minimum: seconds(10), maximum: minutes(2) });
		const [width, height, length] = await Promise.all([
			this.parseOption(args, ['x', 'width'], 8, 1, 10),
			this.parseOption(args, ['y', 'height'], 3, 1, 8),
			this.parseOption(args, ['l', 'length'], 3, 3, 5)
		]);

		const pop = this.generatePop(length);
		const solution = this.generateSolution(length);

		const board = [...this.generateBoard(width, height, pop, solution)].join('\n');
		const embed = new EmbedBuilder()
			.setColor(Colors.Indigo)
			.setTitle(args.t(LanguageKeys.Commands.Fun.PopTitle))
			.setDescription(board)
			.setTimestamp();

		await send(message, { embeds: [embed] });
		const winners = await message.channel.awaitMessages({
			filter: (message: Message) => !message.author.bot && message.content === solution,
			max: 1,
			time
		});

		if (winners.size === 0) {
			embed.setColor(Colors.Red).setTitle(args.t(LanguageKeys.Commands.Fun.PopTitleLost));
		} else {
			const value = getTag(winners.first()!.author);
			embed.setColor(Colors.Green).setTitle(args.t(LanguageKeys.Commands.Fun.PopTitleWinner, { value }));
		}

		embed.setDescription(board.replaceAll('||', '').replaceAll('``', ''));
		await send(message, { embeds: [embed] });
	}

	private generatePop(length: number) {
		if (length <= 3) return 'pop';
		return `p${'o'.repeat(length - 2)}p`;
	}

	private generateSolution(length: number) {
		let output = '';
		for (let i = 0; i < length; ++i) {
			output += this.characters[random(this.characters.length)];
		}

		return output;
	}

	private *generateBoard(width: number, height: number, pop: string, solution: string): IterableIterator<string> {
		const wrappedPop = `||\`${pop}\`||`;
		const wrappedSolution = `||\`${solution}\`||`;
		if (height === 0) {
			return yield this.generateBoardLineWithSolution(wrappedPop, wrappedSolution, width);
		}

		const solutionY = random(height);
		const fullPops = this.generateBoardLineFullPops(wrappedPop, width);

		let y = 0;
		for (; y < solutionY; ++y) yield fullPops;

		yield this.generateBoardLineWithSolution(wrappedPop, wrappedSolution, width);
		++y;

		for (; y < height; ++y) yield fullPops;
	}

	private generateBoardLineFullPops(pop: string, width: number) {
		return pop.repeat(width);
	}

	private generateBoardLineWithSolution(pop: string, solution: string, width: number) {
		const solutionX = random(width);
		return pop.repeat(solutionX) + solution + pop.repeat(width - solutionX - 1);
	}

	private async parseOption(args: SkyraCommand.Args, option: string[], defaultValue: number, minimum: number, maximum: number) {
		const parameter = args.getOption(...option);
		if (parameter === null) return defaultValue;

		const argument = this.integer;
		const result = await argument.run(parameter, {
			args,
			argument,
			command: this,
			commandContext: args.commandContext,
			message: args.message,
			minimum,
			maximum
		});
		return result.unwrapRaw();
	}
}
