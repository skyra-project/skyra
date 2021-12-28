import { CATEGORIES, getQuestion, QuestionData, QuestionDifficulty, QuestionType } from '#lib/games/TriviaManager';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { floatPromise, minutes, seconds } from '#utils/common';
import { sendTemporaryMessage } from '#utils/functions';
import { sendLoadingMessage, shuffle } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageCollector, MessageEmbed, User } from 'discord.js';
import { decode } from 'he';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Games.TriviaDescription,
	detailedDescription: LanguageKeys.Commands.Games.TriviaExtended,
	requiredClientPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory]
})
export class UserCommand extends SkyraCommand {
	#channels = new Set<string>();

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const category = await args.pick(UserCommand.category).catch(() => CATEGORIES.general);
		const questionType = await args.pick(UserCommand.questionType).catch(() => QuestionType.Multiple);
		const difficulty = await args.pick(UserCommand.questionDifficulty).catch(() => QuestionDifficulty.Easy);
		const duration = args.finished ? seconds(30) : await args.pick('timespan', { minimum: seconds(1), maximum: minutes(1) });

		if (this.#channels.has(message.channel.id)) this.error(LanguageKeys.Commands.Games.TriviaActiveGame);
		this.#channels.add(message.channel.id);

		try {
			await sendLoadingMessage(message, args.t);
			const data = await getQuestion(category, difficulty, questionType);
			const possibleAnswers =
				questionType === QuestionType.Boolean
					? ['True', 'False']
					: shuffle([data.correct_answer, ...data.incorrect_answers].map((ans) => decode(ans)));
			const correctAnswer = decode(data.correct_answer);

			const questionEmbed = this.buildQuestionEmbed(args.t, data, possibleAnswers);
			await send(message, { embeds: [questionEmbed] });
			const filter = (msg: Message) => {
				const num = Number(msg.content);
				return Number.isInteger(num) && num > 0 && num <= possibleAnswers.length;
			};
			const collector = new MessageCollector(message.channel, { filter, time: duration });

			let winner: User | null = null;
			// users who have already participated
			const participants = new Set<string>();

			return collector
				.on('collect', (collected: Message) => {
					if (participants.has(collected.author.id)) return;
					const attempt = possibleAnswers[parseInt(collected.content, 10) - 1];
					if (attempt === decode(data.correct_answer)) {
						winner = collected.author;
						return collector.stop();
					}
					participants.add(collected.author.id);
					floatPromise(sendTemporaryMessage(collected, args.t(LanguageKeys.Commands.Games.TriviaIncorrect, { attempt })));
				})
				.on('end', () => {
					this.#channels.delete(message.channel.id);

					const content = winner
						? args.t(LanguageKeys.Commands.Games.TriviaWinner, { winner: winner.toString(), correctAnswer })
						: args.t(LanguageKeys.Commands.Games.TriviaNoAnswer, { correctAnswer });
					floatPromise(send(message, content));
				});
		} catch (error) {
			this.#channels.delete(message.channel.id);
			this.container.logger.fatal(error);
			this.error(LanguageKeys.Misc.UnexpectedIssue);
		}
	}

	public buildQuestionEmbed(t: TFunction, data: QuestionData, possibleAnswers: string[]) {
		const titles = t(LanguageKeys.Commands.Games.TriviaEmbedTitles);
		const questionDisplay = possibleAnswers.map((possible, i) => `${i + 1}. ${possible}`);
		return new MessageEmbed()
			.setAuthor({ name: titles.trivia })
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
