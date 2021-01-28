import { CATEGORIES, getQuestion, QuestionData, QuestionDifficulty, QuestionType } from '#lib/games/TriviaManager';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { Time } from '#utils/constants';
import { pickRandom, shuffle } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolvers } from '@skyra/decorators';
import { DMChannel, Message, MessageCollector, MessageEmbed, TextChannel, User } from 'discord.js';
import { decode } from 'he';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Games.TriviaDescription,
	extendedHelp: LanguageKeys.Commands.Games.TriviaExtended,
	usage: '[category:category] [boolean|truefalse|multiple] [easy|hard|medium] [duration:timespan-seconds]',
	usageDelim: ' ',
	permissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']
})
@CreateResolvers([
	[
		'category',
		async (arg, _, message) => {
			if (!arg) return CATEGORIES.general;
			arg = arg.toLowerCase();
			const category = Reflect.get(CATEGORIES, arg);
			if (!category) throw await message.resolveKey(LanguageKeys.Commands.Games.TriviaInvalidCategory);
			return category;
		}
	],
	[
		'timespan-seconds',
		async (arg, _, message) => {
			if (!arg) return Time.Second * 30;
			let duration = await message.client.arguments.get('timespan')!.run(arg, _, message);
			// In case of a duration of more than 1 minute then reset it to the default of 30 seconds
			if (duration > Time.Minute) duration = Time.Second * 30;
			return duration / 1000;
		}
	]
])
export class UserCommand extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#channels = new Set<string>();

	public async run(
		message: Message,
		[category = CATEGORIES.general, questionType = QuestionType.Multiple, difficulty = QuestionDifficulty.Easy, duration = 30]: [
			number,
			QuestionType?,
			QuestionDifficulty?,
			number?
		]
	) {
		// If a question was a true/false, set it as boolean:
		if (questionType === QuestionType.TrueFalse) questionType = QuestionType.Boolean;

		const t = await message.fetchT();
		if (this.#channels.has(message.channel.id)) throw t(LanguageKeys.Commands.Games.TriviaActiveGame);

		this.#channels.add(message.channel.id);

		try {
			await message.send(pickRandom(t(LanguageKeys.System.Loading)));
			const data = await getQuestion(category, difficulty, questionType);
			const possibleAnswers =
				questionType === QuestionType.Boolean
					? ['True', 'False']
					: shuffle([data.correct_answer, ...data.incorrect_answers].map((ans) => decode(ans)));
			const correctAnswer = decode(data.correct_answer);

			await message.send(this.buildQuestionEmbed(t, data, possibleAnswers));
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
					return message.channel.send(t(LanguageKeys.Commands.Games.TriviaIncorrect, { attempt }));
				})
				.on('end', () => {
					this.#channels.delete(message.channel.id);
					if (!winner) return message.channel.send(t(LanguageKeys.Commands.Games.TriviaNoAnswer, { correctAnswer }));
					return message.channel.send(t(LanguageKeys.Commands.Games.TriviaWinner, { winner: winner.toString(), correctAnswer }));
				});
		} catch (error) {
			this.#channels.delete(message.channel.id);
			this.context.client.logger.fatal(error);
			throw t(LanguageKeys.Misc.UnexpectedIssue);
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
}
