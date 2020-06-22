import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions, CreateResolvers, requiredPermissions, requiresGuildContext } from '@skyra/decorators';
import { BrandingColors, Time } from '@utils/constants';
import { cutText, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, ScheduledTask, Timestamp, util } from 'klasa';

const enum Actions {
	List = 'list',
	Show = 'show',
	Create = 'create',
	Delete = 'delete'
}

interface ReminderScheduledTask extends ScheduledTask {
	data: {
		content: string;
		user: string;
	};
}

const kReminderTaskName = 'reminder';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['remind', 'reminder', 'reminders'],
	bucket: 2,
	subcommands: true,
	cooldown: 30,
	description: language => language.tget('COMMAND_REMINDME_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_REMINDME_EXTENDED'),
	usage: '<action:action> (value:idOrDuration) (description:description)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'action', (arg, _possible, message) => {
			if (!arg) return Actions.List;

			switch (arg.toLowerCase()) {
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
				case 's':
				case 'show': return Actions.Show;
				case 'c':
				case 'create':
				case 'me': return Actions.Create;
				default: {
					message.args.splice(message.params.length, 0, undefined!);
					return Actions.Create;
				}
			}
		}
	],
	[
		'idOrDuration', async (arg, possible, message, [action]: Actions[]) => {
			switch (action) {
				case Actions.List: return undefined;
				case Actions.Show:
				case Actions.Delete: {
					if (!arg) throw message.language.tget('COMMAND_REMINDME_DELETE_NO_ID');
					const id = await message.client.arguments.get('string')!.run(arg, { ...possible, max: 9, min: 9 }, message);
					for (const task of message.client.schedule.tasks) {
						if (task.id !== id) continue;
						if (task.taskName !== kReminderTaskName || !task.data || task.data.user !== message.author.id) break;
						return task;
					}
					throw message.language.tget('COMMAND_REMINDME_NOTFOUND');
				}
				case Actions.Create: {
					if (!arg) throw message.language.tget('COMMAND_REMINDME_CREATE_NO_DURATION');
					return message.client.arguments.get('timespan')!.run(arg, { ...possible, min: Time.Minute }, message);
				}
			}
		}
	],
	[
		'description', (arg, possible, message, [action]: Actions[]) => {
			if (action !== Actions.Create) return undefined;
			if (!arg) return message.language.tget('COMMAND_REMINDME_CREATE_NO_DESCRIPTION');
			return message.client.arguments.get('...string')!.run(arg, { ...possible, max: 1024 }, message);
		}
	]
])
export default class extends SkyraCommand {

	private readonly kTimestamp = new Timestamp('YYYY/MM/DD HH:mm:ss');

	public async create(message: KlasaMessage, [duration, description]: [number, string]) {
		const task = await this.client.schedule.create(kReminderTaskName, Date.now() + duration, {
			catchUp: true,
			data: {
				content: description,
				user: message.author.id
			}
		});

		return message.sendLocale('COMMAND_REMINDME_CREATE', [task.id]);
	}

	@requiresGuildContext((message: KlasaMessage) => message.sendLocale('RESOLVER_CHANNEL_NOT_IN_GUILD_SUBCOMMAND', [message.command!.name, 'list']))
	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async list(message: KlasaMessage) {
		const tasks = this.client.schedule.tasks.filter(task => task.data && task.data.user === message.author.id);
		if (!tasks.length) return message.sendLocale('COMMAND_REMINDME_LIST_EMPTY');

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true })));

		const pages = util.chunk(tasks.map(task => `\`${task.id}\` - \`${this.kTimestamp.display(task.time)}\` - ${cutText(task.data.content, 40)}`), 10);
		for (const page of pages) display.addPage((template: MessageEmbed) => template.setDescription(page.join('\n')));

		const response = await message.sendEmbed(new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: BrandingColors.Secondary }));
		await display.start(response, message.author.id);
		return response;
	}

	public async show(message: KlasaMessage, [task]: [ReminderScheduledTask]) {
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(task.data.content)
			.setFooter(message.language.tget('COMMAND_REMINDME_SHOW_FOOTER', task.id))
			.setTimestamp(task.time));
	}

	public async delete(message: KlasaMessage, [task]: [ReminderScheduledTask]) {
		await task.delete();
		return message.sendLocale('COMMAND_REMINDME_DELETE', [task]);
	}

}
