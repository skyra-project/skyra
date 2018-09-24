const { Command, PromptList, Timestamp, Duration, constants: { TIME: { YEAR } }, klasaUtil: { isNumber } } = require('../../index');
const timestamp = new Timestamp('YYYY/MM/DD hh:mm:ss');
const REMINDER_TYPE = 'reminder';

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['remind', 'reminder'],
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_REMINDME_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_REMINDME_EXTENDED'),
			usage: '[list|delete|me] [input:...string]',
			usageDelim: ' '
		});
	}

	public async run(msg, [action, data]) {
		if (!data || action === 'list') return this.list(msg);
		if (action === 'delete') return this.delete(msg, data);

		const { time, title } = await this.parseInput(msg, data);
		const task = await this.client.schedule.create(REMINDER_TYPE, Date.now() + time, {
			catchUp: true,
			data: {
				content: title,
				user: msg.author.id
			}
		});

		return msg.sendLocale('COMMAND_REMINDME_CREATE', [task.id]);
	}

	public async list(msg) {
		const tasks = this.client.schedule.tasks.filter((task) => task.data && task.data.user === msg.author.id);
		if (!tasks.length) return msg.sendLocale('COMMAND_REMINDME_LIST_EMPTY');
		await new PromptList(tasks.map((task) => [
			task.id,
			`${timestamp.display(task.time)} - ${task.data.content.length > 40 ? `${task.data.content.slice(0, 40)}...` : task.data.content}`
		])).run(msg).catch(() => null);

		return msg;
	}

	public async delete(msg, data) {
		if (!data) throw msg.language.get('COMMAND_REMINDME_DELETE_INVALID_PARAMETERS');
		const [id] = data;
		let selectedTask = null;
		for (const task of this.client.schedule.tasks) {
			if (task.id !== id) continue;
			if (task.taskName !== REMINDER_TYPE || !task.data || task.data.user !== msg.author.id) break;
			selectedTask = task;
		}
		if (!selectedTask) throw msg.language.get('COMMAND_REMINDME_NOTFOUND');
		await selectedTask.delete();
		return msg.sendLocale('COMMAND_REMINDME_DELETE', [selectedTask]);
	}

	public async parseInput(msg, string) {
		const parsed = {
			time: null,
			title: null
		};

		if (/^in\s/.test(string)) {
			const indexOfTitle = string.lastIndexOf(' to ');
			parsed.time = new Duration(string.slice(3, indexOfTitle > -1 ? indexOfTitle : undefined)).offset;
			parsed.title = indexOfTitle > -1 ? string.slice(indexOfTitle + 4) : 'Something, you did not tell me what to remind you.';
		} else {
			const indexOfTime = string.lastIndexOf(' in ');
			parsed.title = string.slice(/^to\s/.test(string) ? 3 : 0, indexOfTime > -1 ? indexOfTime : undefined);

			if (indexOfTime !== -1)
				parsed.time = new Duration(string.slice(indexOfTime + 4)).offset;
		}

		if (!isNumber(parsed.time) || parsed.time < 59500 || parsed.time > (YEAR * 5))
			parsed.time = await this.askTime(msg, msg.language.get('COMMAND_REMINDME_INPUT_PROMPT'));

		return parsed;
	}

	public async askTime(msg, alert) {
		await msg.sendMessage(alert);

		let time, attempts = 0;
		do {
			const messages = await msg.channel.awaitMessages((message) => message.author === msg.author, { time: 30000, max: 1 });
			if (!messages.size) throw null;
			time = new Duration(messages.first().content).offset;
			attempts++;
		} while (time < 60000 && attempts < 5);

		if (!time || time < 60000) throw msg.language.get('COMMAND_REMINDME_SHORT_TIME');
		return time;
	}

};
