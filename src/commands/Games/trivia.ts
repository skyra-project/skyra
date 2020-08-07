import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage, KlasaUser } from 'klasa';
import { CATEGORIES, QuestionType, QuestionDifficulty, QuestionData, getQuestion } from '@utils/Games/TriviaManager';
import { decode } from 'he';
import { shuffle } from '@utils/util';
import { MessageEmbed, MessageCollector } from 'discord.js';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 5,
	description: language => language.tget('COMMAND_TRIVIA_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_TRIVIA_EXTENDED'),
	usage: '(category:category) [boolean|multiple] [easy|hard|medium] [duration:int{30,60}]',
	usageDelim: ' '
})
export default class extends RichDisplayCommand {

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#channels = new Set<string>();

	public async run(message: KlasaMessage, [category, questionType = undefined, difficulty = undefined, duration = 30]: [number, QuestionType?, QuestionDifficulty?, number?]) {
		if (this.#channels.has(message.channel.id)) throw message.language.tget('COMMAND_TRIVIA_ACTIVE_GAME');

		this.#channels.add(message.channel.id);

		try {
			await message.sendLocale('SYSTEM_LOADING');
			const data = await getQuestion(category, difficulty, questionType);
			const possibleAnswers = questionType === QuestionType.Boolean
				? ['True', 'False']
				: shuffle([data.correct_answer, ...data.incorrect_answers].map(ans => decode(ans)));
			const correctAnswer = decode(data.correct_answer);

			await message.sendEmbed(this.buildQuestionEmbed(message, data, possibleAnswers));
			const filter = (msg: KlasaMessage) => {
				const num = Number(msg.content);
				return Number.isInteger(num) && num > 0 && num <= possibleAnswers.length;
			};
			const collector = new MessageCollector(message.channel, filter, { time: duration * 1000 });

			let winner: KlasaUser | null = null;
			// users who have already participated
			const participants = new Set<string>();

			collector.on('collect', (collected: KlasaMessage) => {
				if (participants.has(collected.author.id)) return;
				const attempt = possibleAnswers[parseInt(collected.content, 10) - 1];
				if (attempt === decode(data.correct_answer)) {
					winner = collected.author;
					return collector.stop();
				}
				participants.add(collected.author.id);
				return message.channel.sendLocale('COMMAND_TRIVIA_INCORRECT', [attempt]);
			});

			collector.on('end', () => {
				this.#channels.delete(message.channel.id);
				if (!winner) return message.channel.sendLocale('COMMAND_TRIVIA_NO_ANSWER', [correctAnswer]);
				return message.channel.sendLocale('COMMAND_TRIVIA_WINNER', [winner, correctAnswer]);
			});
		} catch {
			this.#channels.delete(message.channel.id);
			throw message.language.tget('UNEXPECTED_ISSUE');
		}

	}

	public buildQuestionEmbed(message: KlasaMessage, data: QuestionData, possibleAnswers: string[]) {
		const TITLES = message.language.tget('COMMAND_TRIVIA_EMBED_TITLES');
		const questionDisplay = possibleAnswers.map((possible, i) => `${i + 1}. ${possible}`);
		return new MessageEmbed()
			.setAuthor(TITLES.TRIVIA)
			.setTitle(data.category)
			.setColor(0xf37917)
			.setThumbnail('http://i.imgur.com/zPtu5aP.png')
			.setDescription([
				`${TITLES.DIFFICULTY}: ${data.difficulty}`,
				'',
				decode(data.question),
				'',
				questionDisplay.join('\n')
			].join('\n'));
	}

	public async init() {
		this.createCustomResolver('category', (arg, possible, message) => {
			if (!arg) return CATEGORIES.general;
			arg = arg.toLowerCase();
			const category = Reflect.get(CATEGORIES, arg);
			if (!category) throw message.language.tget('COMMAND_TRIVIA_INVALID_CATEGORY');
			return category;
		});
	}

}
