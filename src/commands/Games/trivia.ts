import { CATEGORIES, getQuestion, QuestionData, QuestionDifficulty, QuestionType } from '#lib/games/TriviaManager';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { Time } from '#utils/constants';
import { pickRandom, shuffle } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { DMChannel, Message, MessageCollector, MessageEmbed, TextChannel, User } from 'discord.js';
import { decode } from 'he';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Games.TriviaDescription,
	extendedHelp: LanguageKeys.Commands.Games.TriviaExtended,
	permissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']
})
export class UserCommand extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#channels = new Set<string>();

	public async run(message: Message, args: SkyraCommand.Args) {
		const category = args.finished ? CATEGORIES.general : await args.pick(UserCommand.category);
		const questionType = args.finished ? QuestionType.Multiple : await args.pick(UserCommand.questionType).catch(() => QuestionType.Multiple);
		const difficulty = await args.pick(UserCommand.questionDifficulty).catch(() => QuestionDifficulty.Easy);
		const duration = args.finished ? 30 : await args.pick('timespan', { minimum: Time.Second, maximum: Time.Minute });

		if (this.#channels.has(message.channel.id)) throw args.t(LanguageKeys.Commands.Games.TriviaActiveGame);
		this.#channels.add(message.channel.id);

		try {
			await message.send(pickRandom(args.t(LanguageKeys.System.Loading)));
			const data = await getQuestion(category, difficulty, questionType);
			const possibleAnswers =
				questionType === QuestionType.Boolean
					? ['True', 'False']
					: shuffle([data.correct_answer, ...data.incorrect_answers].map((ans) => decode(ans)));
			const correctAnswer = decode(data.correct_answer);

			await message.send(this.buildQuestionEmbed(args.t, data, possibleAnswers));
			const filter = (msg: Message) => {
				const num = Number(msg.content);
				return Number.isInteger(num) && num > 0 && num <= possibleAnswers.length;
			};
			const collector = new MessageCollector(message.channel as TextChannel | DMChannel, filter, { time: duration * 1000 });

			let winner: User | null = null;
			// users who have already participated
			const participants = new Set<string>();

			collector
				.on('collect', (collected: Message) => {
					if (participants.has(collected.author.id)) return;
					const attempt = possibleAnswers[parseInt(collected.content, 10) - 1];
					if (attempt === decode(data.correct_answer)) {
						winner = collected.author;
						return collector.stop();
					}
					participants.add(collected.author.id);
					return message.channel.send(args.t(LanguageKeys.Commands.Games.TriviaIncorrect, { attempt }));
				})
				.on('end', () => {
					this.#channels.delete(message.channel.id);
					if (!winner) return message.channel.send(args.t(LanguageKeys.Commands.Games.TriviaNoAnswer, { correctAnswer }));
					return message.channel.send(args.t(LanguageKeys.Commands.Games.TriviaWinner, { winner: winner.toString(), correctAnswer }));
				});
		} catch (error) {
			this.#channels.delete(message.channel.id);
			this.context.client.logger.fatal(error);
			throw args.t(LanguageKeys.Misc.UnexpectedIssue);
		}
	}

	public buildQuestionEmbed(t: TFunction, data: QuestionData, possibleAnswers: string[]) {
		const titles = t(LanguageKeys.Commands.Games.TriviaEmbedTitles);
		const questionDisplay = possibleAnswers.map((possible, i) => `${i + 1}. ${possible}`);
		return new MessageEmbed()
			.setAuthor(titles.trivia)
			.setTitle(data.category)
			.setColor(0xf37917)
			.setThumbnail('http://i.imgur.com/zPtu5aP.png')
			.setDescription([`${titles.difficulty}: ${data.difficulty}`, '', decode(data.question), '', questionDisplay.join('\n')].join('\n'));
	}

	private static category = Args.make<number>((parameter, { argument }) => {
		const lowerCasedParameter = parameter.toLowerCase();
		const category = Reflect.get(CATEGORIES, lowerCasedParameter);
		if (typeof category === 'number') return Args.ok(category);
		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Games.TriviaInvalidCategory });
	});

	private static questionType = Args.make<QuestionType>((parameter, { argument }) => {
		const lowerCasedParameter = parameter.toLowerCase();
		if (lowerCasedParameter === 'boolean' || lowerCasedParameter === 'truefalse') return Args.ok(QuestionType.Boolean);
		if (lowerCasedParameter === 'multiple') return Args.ok(QuestionType.Multiple);
		return Args.error({ argument, parameter });
	});

	private static questionDifficulty = Args.make<QuestionDifficulty>((parameter, { argument }) => {
		const lowerCasedParameter = parameter.toLowerCase();
		if (lowerCasedParameter === 'easy') return Args.ok(QuestionDifficulty.Easy);
		if (lowerCasedParameter === 'medium') return Args.ok(QuestionDifficulty.Medium);
		if (lowerCasedParameter === 'hard') return Args.ok(QuestionDifficulty.Hard);
		return Args.error({ argument, parameter });
	});
}
