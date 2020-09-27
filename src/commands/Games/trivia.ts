import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Time } from '@utils/constants';
import { CATEGORIES, getQuestion, QuestionData, QuestionDifficulty, QuestionType } from '@utils/Games/TriviaManager';
import { pickRandom, shuffle } from '@utils/util';
import { DMChannel, MessageCollector, MessageEmbed, TextChannel, User } from 'discord.js';
import { decode } from 'he';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.Games.TriviaDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Games.TriviaExtended),
	usage: '[category:category] [boolean|truefalse|multiple] [easy|hard|medium] [duration:timespan-seconds]',
	usageDelim: ' ',
	requiredPermissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']
})
@CreateResolvers([
	[
		'category',
		(arg, _, message) => {
			if (!arg) return CATEGORIES.general;
			arg = arg.toLowerCase();
			const category = Reflect.get(CATEGORIES, arg);
			if (!category) throw message.language.get(LanguageKeys.Commands.Games.TriviaInvalidCategory);
			return category;
		}
	],
	[
		'timespan-seconds',
		(arg, _, message) => {
			let duration = message.client.arguments.get('timespan')!.run(arg, _, message);
			// In case of a duration of more than 1 minute then reset it to the default of 30 seconds
			if (duration > Time.Minute) duration = Time.Minute * 0.5;
			return duration / 1000;
		}
	]
])
export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#channels = new Set<string>();

	public async run(
		message: KlasaMessage,
		[category = CATEGORIES.general, questionType = QuestionType.Multiple, difficulty = QuestionDifficulty.Easy, duration = 30]: [
			number,
			QuestionType?,
			QuestionDifficulty?,
			number?
		]
	) {
		if (this.#channels.has(message.channel.id)) throw message.language.get(LanguageKeys.Commands.Games.TriviaActiveGame);

		this.#channels.add(message.channel.id);

		try {
			await message.send(pickRandom(message.language.get(LanguageKeys.System.Loading)), []);
			const data = await getQuestion(category, difficulty, questionType);
			const possibleAnswers =
				questionType === QuestionType.Boolean || questionType === QuestionType.TrueFalse
					? ['True', 'False']
					: shuffle([data.correct_answer, ...data.incorrect_answers].map((ans) => decode(ans)));
			const correctAnswer = decode(data.correct_answer);

			await message.sendEmbed(this.buildQuestionEmbed(message, data, possibleAnswers));
			const filter = (msg: KlasaMessage) => {
				const num = Number(msg.content);
				return Number.isInteger(num) && num > 0 && num <= possibleAnswers.length;
			};
			const collector = new MessageCollector(message.channel as TextChannel | DMChannel, filter, { time: duration * 1000 });

			let winner: User | null = null;
			// users who have already participated
			const participants = new Set<string>();

			collector
				.on('collect', (collected: KlasaMessage) => {
					if (participants.has(collected.author.id)) return;
					const attempt = possibleAnswers[parseInt(collected.content, 10) - 1];
					if (attempt === decode(data.correct_answer)) {
						winner = collected.author;
						return collector.stop();
					}
					participants.add(collected.author.id);
					return message.channel.sendLocale(LanguageKeys.Commands.Games.TriviaIncorrect, [{ attempt }]);
				})
				.on('end', () => {
					this.#channels.delete(message.channel.id);
					if (!winner) return message.channel.sendLocale(LanguageKeys.Commands.Games.TriviaNoAnswer, [{ correctAnswer }]);
					return message.channel.sendLocale(LanguageKeys.Commands.Games.TriviaWinner, [{ winner: winner.toString(), correctAnswer }]);
				});
		} catch {
			this.#channels.delete(message.channel.id);
			throw message.language.get(LanguageKeys.Misc.UnexpectedIssue);
		}
	}

	public buildQuestionEmbed(message: KlasaMessage, data: QuestionData, possibleAnswers: string[]) {
		const titles = message.language.get(LanguageKeys.Commands.Games.TriviaEmbedTitles);
		const questionDisplay = possibleAnswers.map((possible, i) => `${i + 1}. ${possible}`);
		return new MessageEmbed()
			.setAuthor(titles.trivia)
			.setTitle(data.category)
			.setColor(0xf37917)
			.setThumbnail('http://i.imgur.com/zPtu5aP.png')
			.setDescription([`${titles.difficulty}: ${data.difficulty}`, '', decode(data.question), '', questionDisplay.join('\n')].join('\n'));
	}
}
