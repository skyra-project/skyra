import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { BrandingColors, Time } from '@utils/constants';
import { cutText, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, ScheduledTask, Timestamp, util } from 'klasa';
import { ApplyOptions } from '@skyra/decorators';

const enum Actions {
	List = 'list',
	Create = 'create',
	Delete = 'delete'
}

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['remind', 'reminder'],
	bucket: 2,
	subcommands: true,
	cooldown: 30,
	description: language => language.tget('COMMAND_REMINDME_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_REMINDME_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<action:action> (value:idOrDuration) (description:description)',
	usageDelim: ' '
})
export default class extends SkyraCommand {

	private readonly kTimestamp = new Timestamp('YYYY/MM/DD HH:mm:ss');
	private readonly kReminderTaskName = 'reminder';

	public async create(message: KlasaMessage, [duration, description]: [number, string]) {
		const task = await this.client.schedule.create(this.kReminderTaskName, Date.now() + duration, {
			catchUp: true,
			data: {
				content: description,
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

		const pages = util.chunk(tasks.map(task => `\`${task.id}\` - \`${this.kTimestamp.display(task.time)}\` - ${cutText(task.data.content, 40)}`), 10);
		for (const page of pages) display.addPage((template: MessageEmbed) => template.setDescription(page.join('\n')));

		const response = await message.sendEmbed(new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: BrandingColors.Secondary }));
		await display.start(response, message.author.id);
		return response;
	}

	public async delete(message: KlasaMessage, [id]: [string]) {
		let selectedTask: ScheduledTask | null = null;
		for (const task of this.client.schedule.tasks) {
			if (task.id !== id) continue;
			if (task.taskName !== this.kReminderTaskName || !task.data || task.data.user !== message.author.id) break;
			selectedTask = task;
		}
		if (!selectedTask) throw message.language.tget('COMMAND_REMINDME_NOTFOUND');
		await selectedTask.delete();
		return message.sendLocale('COMMAND_REMINDME_DELETE', [selectedTask]);
	}

	public async init() {
		this.createCustomResolver('action', (arg, _possible, message) => {
			if (!arg) return Actions.List;

			switch (arg.toLowerCase()) {
				case 's':
				case 'show':
				case 'a':
				case 'all':
				case 'l':
				case 'list': return Actions.List;
				case 'r':
				case 'rm':
				case 'remove':
				case 'd':
				case 'del':
				case 'delete': return Actions.Delete;
				case 'c':
				case 'create': message.args.splice(message.params.length, 0, undefined!);
				// Fallback
				case 'me':
				default: return Actions.Create;
			}
		});

		this.createCustomResolver('idOrDuration', (arg, possible, message, [action]: Actions[]) => {
			switch (action) {
				case Actions.List: return undefined;
				case Actions.Delete: {
					if (!arg) throw message.language.tget('COMMAND_REMINDME_DELETE_NO_ID');
					return this.client.arguments.get('string')!.run(arg, { ...possible, max: 9, min: 9 }, message);
				}
				case Actions.Create: {
					if (!arg) throw message.language.tget('COMMAND_REMINDME_CREATE_NO_DURATION');
					return this.client.arguments.get('timespan')!.run(arg, { ...possible, min: Time.Minute }, message);
				}
			}
		});

		this.createCustomResolver('description', (arg, possible, message, [action]: Actions[]) => {
			if (action !== Actions.Create) return undefined;
			if (!arg) return message.language.tget('COMMAND_REMINDME_CREATE_NO_DESCRIPTION');
			return this.client.arguments.get('...string')!.run(arg, { ...possible, max: 1024 }, message);
		});
	}

}
