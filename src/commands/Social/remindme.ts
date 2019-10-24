import { MessageEmbed } from 'discord.js';
import { CommandStore, Duration, KlasaMessage, Timestamp, util, ScheduledTask } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { TIME, BrandingColors } from '../../lib/util/constants';
import { cutText, getColor } from '../../lib/util/util';

const timestamp = new Timestamp('YYYY/MM/DD hh:mm:ss');
const REMINDER_TYPE = 'reminder';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['remind', 'reminder'],
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_REMINDME_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_REMINDME_EXTENDED'),
			usage: '[list|delete|me] [input:...string]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [action, data]: [string, string]) {
		if (!data || action === 'list') return this.list(message);
		if (action === 'delete') return this.delete(message, data);

		const { time, title } = await this.parseInput(message, data);
		const task = await this.client.schedule.create(REMINDER_TYPE, Date.now() + time!, {
			catchUp: true,
			data: {
				content: title,
				user: message.author.id
			}
		});

		return message.sendLocale('COMMAND_REMINDME_CREATE', [task.id]);
	}

	public async list(message: KlasaMessage) {
		const tasks = this.client.schedule.tasks.filter(task => task.data && task.data.user === message.author.id);
		if (!tasks.length) return message.sendLocale('COMMAND_REMINDME_LIST_EMPTY');

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL()));

		const pages = util.chunk(tasks.map(task => `\`${task.id}\` - \`${timestamp.display(task.time)}\` - ${cutText(task.data.content, 40)}`), 10);
		for (const page of pages) display.addPage((template: MessageEmbed) => template.setDescription(page.join('\n')));

		const response = await message.sendEmbed(new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: BrandingColors.Secondary }));
		await display.start(response, message.author.id);
		return response;
	}

	public async delete(message: KlasaMessage, id: string) {
		if (!id) throw message.language.tget('COMMAND_REMINDME_DELETE_INVALID_PARAMETERS');
		let selectedTask: ScheduledTask | null = null;
		for (const task of this.client.schedule.tasks) {
			if (task.id !== id) continue;
			if (task.taskName !== REMINDER_TYPE || !task.data || task.data.user !== message.author.id) break;
			selectedTask = task;
		}
		if (!selectedTask) throw message.language.tget('COMMAND_REMINDME_NOTFOUND');
		await selectedTask.delete();
		return message.sendLocale('COMMAND_REMINDME_DELETE', [selectedTask]);
	}

	public async parseInput(message: KlasaMessage, input: string) {
		const parsed: { time: number | null; title: string | null } = {
			time: null,
			title: null
		};

		if (/^in\s/.test(input)) {
			const indexOfTitle = input.lastIndexOf(' to ');
			parsed.time = new Duration(input.slice(3, indexOfTitle > -1 ? indexOfTitle : undefined)).offset;
			parsed.title = indexOfTitle > -1 ? input.slice(indexOfTitle + 4) : 'Something, you did not tell me what to remind you.';
		} else {
			const indexOfTime = input.lastIndexOf(' in ');
			parsed.title = input.slice(/^to\s/.test(input) ? 3 : 0, indexOfTime > -1 ? indexOfTime : undefined);

			if (indexOfTime !== -1) {
				parsed.time = new Duration(input.slice(indexOfTime + 4)).offset;
			}
		}

		if (!util.isNumber(parsed.time) || parsed.time < 59500 || parsed.time > (TIME.YEAR * 5)) {
			parsed.time = await this.askTime(message, message.language.tget('COMMAND_REMINDME_INPUT_PROMPT'));
		}

		return parsed;
	}

	public async askTime(message: KlasaMessage, alert: string) {
		await message.sendMessage(alert);

		let time: number;
		let attempts = 0;
		do {
			const messages = await message.channel.awaitMessages(msg => msg.author === message.author, { time: 30000, max: 1 });
			if (!messages.size) throw null;
			time = new Duration(messages.first()!.content).offset;
			attempts++;
		} while (time < 60000 && attempts < 5);

		if (!time || time < 60000) throw message.language.tget('COMMAND_REMINDME_SHORT_TIME');
		return time;
	}

}
