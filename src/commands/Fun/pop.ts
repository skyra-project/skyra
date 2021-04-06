import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { Colors } from '#lib/types/Constants';
import { random } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Argument } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Fun.PopDescription,
	extendedHelp: LanguageKeys.Commands.Fun.PopExtended,
	strategyOptions: { options: ['x', 'width', 'y', 'height', 'l', 'length'] }
})
export class UserCommand extends SkyraCommand {
	private readonly characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	private get integer(): Argument<number> {
		return this.context.stores.get('arguments').get('integer') as Argument<number>;
	}

	public async run(message: Message, args: SkyraCommand.Args) {
		const time = args.finished ? Time.Second * 30 : await args.pick('timespan', { minimum: Time.Second * 10, maximum: Time.Minute * 2 });
		const [width, height, length] = await Promise.all([
			this.parseOption(args, ['x', 'width'], 8, 1, 10),
			this.parseOption(args, ['y', 'height'], 3, 1, 8),
			this.parseOption(args, ['l', 'length'], 3, 3, 5)
		]);

		const pop = this.generatePop(length);
		const solution = this.generateSolution(length);

		const board = [...this.generateBoard(width, height, pop, solution)].join('\n');
		const embed = new MessageEmbed()
			.setColor(Colors.Indigo)
			.setTitle(args.t(LanguageKeys.Commands.Fun.PopTitle))
			.setDescription(board)
			.setTimestamp();

		await message.send(embed);
		const winners = await message.channel.awaitMessages((message: Message) => !message.author.bot && message.content === solution, {
			max: 1,
			time
		});

		if (winners.size === 0) {
			embed.setColor(Colors.Red).setTitle(args.t(LanguageKeys.Commands.Fun.PopTitleLost));
		} else {
			const value = winners.first()!.author.tag;
			embed.setColor(Colors.Green).setTitle(args.t(LanguageKeys.Commands.Fun.PopTitleWinner, { value }));
		}

		const unmasked = board.replaceAll('||', '').replaceAll('``', '');
		await message.send(embed.setDescription(unmasked));
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

	private *generateBoard(width: number, height: number, pop: string, solution: string) {
		const solutionX = random(width);
		const solutionY = random(height);

		const wrappedPop = `||\`${pop}\`||`;
		const wrappedSolution = `||\`${solution}\`||`;

		const fullPops = wrappedPop.repeat(width);

		let y = 0;
		for (; y < solutionY; ++y) yield fullPops;

		yield wrappedPop.repeat(solutionX) + wrappedSolution + wrappedPop.repeat(width - solutionX - 1);
		++y;

		for (; y < height; ++y) yield fullPops;
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
		if (result.success) return result.value;
		throw result.error;
	}
}
