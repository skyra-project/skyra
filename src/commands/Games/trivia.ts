import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage, KlasaUser } from 'klasa';
import TriviaManager, { CATEGORIES, QuestionType, QuestionDifficulty, QuestionData } from '@utils/Games/TriviaManager';
import { decode } from 'he';
import { shuffle } from '@utils/util';
import { MessageEmbed, MessageCollector } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: language => language.tget('COMMAND_TRIVIA_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_TRIVIA_EXTENDED'),
	usage: '(category:category) [boolean|multiple] [easy|hard|medium] [duration:int{30,60}]',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#channels = new Set<string>();

	public async run(message: KlasaMessage, [category, questionType = undefined, difficulty = undefined, duration = 30]: [number, QuestionType?, QuestionDifficulty?, number?]) {
		if (this.#channels.has(message.channel.id)) throw message.language.tget('COMMAND_TRIVIA_ACTIVE_GAME');

		this.#channels.add(message.channel.id);
		await message.sendLocale('SYSTEM_LOADING');
		const data = await TriviaManager.getQuestion(category, difficulty, questionType);
		const possibleAnswers = questionType === QuestionType.BOOLEAN
			? ['True', 'False']
			: shuffle([data.correct_answer, ...data.incorrect_answers].map(ans => decode(ans)));
		const correctAnswer = decode(data.correct_answer);

		await message.sendEmbed(this.buildQuestionEmbed(message, data, possibleAnswers));
		const filter = (msg: KlasaMessage) => {
			const num = parseInt(msg.content, 10);
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
			if (!Reflect.has(CATEGORIES, arg)) throw message.language.tget('COMMAND_TRIVIA_INVALID_CATEGORY');
			return Reflect.get(CATEGORIES, arg);
		});
	}

}
