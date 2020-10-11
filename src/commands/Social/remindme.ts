import { ScheduleEntity } from '@lib/database/entities/ScheduleEntity';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Schedules } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk, cutText } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers, requiredPermissions, requiresGuildContext } from '@skyra/decorators';
import { BrandingColors, Time } from '@utils/constants';
import { pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Timestamp } from 'klasa';

const enum Actions {
	List = 'list',
	Show = 'show',
	Create = 'create',
	Delete = 'delete'
}

interface ReminderScheduledTask extends ScheduleEntity {
	data: {
		content: string;
		user: string;
	};
}

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['remind', 'reminder', 'reminders'],
	bucket: 2,
	subcommands: true,
	cooldown: 30,
	description: (language) => language.get(LanguageKeys.Commands.Social.RemindmeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.RemindmeExtended),
	usage: '<action:action> (value:idOrDuration) (description:description)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'action',
		(arg, _possible, message) => {
			if (!arg) return Actions.List;

			switch (arg.toLowerCase()) {
				case 'a':
				case 'all':
				case 'l':
				case 'list':
					return Actions.List;
				case 'r':
				case 'rm':
				case 'remove':
				case 'd':
				case 'del':
				case 'delete':
					return Actions.Delete;
				case 's':
				case 'show':
					return Actions.Show;
				case 'c':
				case 'create':
				case 'me':
					return Actions.Create;
				default: {
					message.args.splice(message.params.length, 0, undefined!);
					return Actions.Create;
				}
			}
		}
	],
	[
		'idOrDuration',
		async (arg, possible, message, [action]: Actions[]) => {
			switch (action) {
				case Actions.List:
					return undefined;
				case Actions.Show:
				case Actions.Delete: {
					if (!arg) throw message.language.get(LanguageKeys.Commands.Social.RemindmeDeleteNoId);
					const id: number = await message.client.arguments.get('integer')!.run(arg, possible, message);
					for (const task of message.client.schedules.queue) {
						if (task.id !== id) continue;
						if (task.taskID !== Schedules.Reminder || !task.data || task.data.user !== message.author.id) break;
						return task;
					}
					throw message.language.get(LanguageKeys.Commands.Social.RemindmeNotfound);
				}
				case Actions.Create: {
					if (!arg) throw message.language.get(LanguageKeys.Commands.Social.RemindmeCreateNoDuration);
					return message.client.arguments.get('timespan')!.run(arg, { ...possible, min: Time.Minute }, message);
				}
			}
		}
	],
	[
		'description',
		(arg, possible, message, [action]: Actions[]) => {
			if (action !== Actions.Create) return undefined;
			if (!arg) return message.language.get(LanguageKeys.Commands.Social.RemindmeCreateNoDescription);
			return message.client.arguments.get('...string')!.run(arg, { ...possible, max: 1024 }, message);
		}
	]
])
export default class extends SkyraCommand {
	private readonly kTimestamp = new Timestamp('YYYY/MM/DD HH:mm:ss');

	public async create(message: KlasaMessage, [duration, description]: [number, string]) {
		const task = await this.client.schedules.add(Schedules.Reminder, Date.now() + duration, {
			catchUp: true,
			data: {
				content: description,
				user: message.author.id
			}
		});

		return message.sendLocale(LanguageKeys.Commands.Social.RemindmeCreate, [{ id: task.id.toString() }]);
	}

	@requiresGuildContext((message: KlasaMessage) =>
		message.sendLocale(LanguageKeys.Resolvers.ChannelNotInGuildSubcommand, [{ command: message.command!.name, subcommand: 'list' }])
	)
	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async list(message: KlasaMessage) {
		const tasks = this.client.schedules.queue.filter((task) => task.data && task.data.user === message.author.id);
		if (!tasks.length) return message.sendLocale(LanguageKeys.Commands.Social.RemindmeListEmpty);

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
		);

		const pages = chunk(
			tasks.map((task) => `\`${task.id}\` - \`${this.kTimestamp.display(task.time)}\` - ${cutText(task.data.content as string, 40)}`),
			10
		);
		for (const page of pages) display.addPage((template: MessageEmbed) => template.setDescription(page.join('\n')));

		const response = await message.sendEmbed(
			new MessageEmbed({ description: pickRandom(message.language.get(LanguageKeys.System.Loading)), color: BrandingColors.Secondary })
		);
		await display.start(response, message.author.id);
		return response;
	}

	@requiredPermissions(['EMBED_LINKS'])
	public async show(message: KlasaMessage, [task]: [ReminderScheduledTask]) {
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
				.setDescription(task.data.content)
				.setFooter(message.language.get(LanguageKeys.Commands.Social.RemindmeShowFooter, { id: task.id }))
				.setTimestamp(task.time)
		);
	}

	public async delete(message: KlasaMessage, [task]: [ReminderScheduledTask]) {
		const { id } = task;
		await task.delete();
		return message.sendLocale(LanguageKeys.Commands.Social.RemindmeDelete, [{ task, id }]);
	}
}
