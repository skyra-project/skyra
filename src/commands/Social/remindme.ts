import { DbSet, ScheduleEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { Schedules } from '#lib/types/Enums';
import { BrandingColors, Time } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk, cutText } from '@sapphire/utilities';
import { CreateResolvers, requiredPermissions, requiresGuildContext } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

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

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['remind', 'reminder', 'reminders'],
	bucket: 2,
	subcommands: true,
	cooldown: 30,
	description: LanguageKeys.Commands.Social.RemindMeDescription,
	extendedHelp: LanguageKeys.Commands.Social.RemindMeExtended,
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
			const t = await message.fetchT();
			switch (action) {
				case Actions.List:
					return undefined;
				case Actions.Show:
				case Actions.Delete: {
					if (!arg) throw t(LanguageKeys.Commands.Social.RemindMeDeleteNoID);
					const id: number = await message.client.arguments.get('integer')!.run(arg, possible, message);
					for (const task of message.client.schedules.queue) {
						if (task.id !== id) continue;
						if (task.taskID !== Schedules.Reminder || !task.data || task.data.user !== message.author.id) break;
						return task;
					}
					throw t(LanguageKeys.Commands.Social.RemindMeNotFound);
				}
				case Actions.Create: {
					if (!arg) throw t(LanguageKeys.Commands.Social.RemindMeCreateNoDuration);
					return message.client.arguments.get('timespan')!.run(arg, { ...possible, min: Time.Minute }, message);
				}
			}
		}
	],
	[
		'description',
		(arg, possible, message, [action]: Actions[]) => {
			if (action !== Actions.Create) return undefined;
			if (!arg) return message.resolveKey(LanguageKeys.Commands.Social.RemindMeCreateNoDescription);
			return message.client.arguments.get('...string')!.run(arg, { ...possible, max: 1024 }, message);
		}
	]
])
export class UserCommand extends SkyraCommand {
	public async create(message: Message, [duration, description]: [number, string]) {
		const task = await this.context.client.schedules.add(Schedules.Reminder, Date.now() + duration, {
			catchUp: true,
			data: {
				content: description,
				user: message.author.id
			}
		});

		return message.sendTranslated(LanguageKeys.Commands.Social.RemindMeCreate, [{ id: task.id.toString() }]);
	}

	@requiresGuildContext((message: Message) =>
		message.sendTranslated(LanguageKeys.Resolvers.ChannelNotInGuildSubCommand, [{ command: message.command!.name, subcommand: 'list' }])
	)
	@requiredPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async list(message: GuildMessage) {
		const { client } = this.context;
		const tasks = client.schedules.queue.filter((task) => task.data && task.data.user === message.author.id);
		if (!tasks.length) return message.sendTranslated(LanguageKeys.Commands.Social.RemindMeListEmpty);

		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(client.user!.username, client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
		});

		const t = await message.fetchT();
		const pages = chunk(
			tasks.map(
				(task) =>
					`\`${task.id}\` - \`${t(LanguageKeys.Globals.DateTimeValue, { value: task.time })}\` - ${cutText(
						task.data.content as string,
						40
					)}`
			),
			10
		);
		for (const page of pages) display.addPageEmbed((template) => template.setDescription(page.join('\n')));

		const response = await message.send(
			new MessageEmbed({
				description: pickRandom(t(LanguageKeys.System.Loading)),
				color: BrandingColors.Secondary
			})
		);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	@requiredPermissions(['EMBED_LINKS'])
	public async show(message: Message, [task]: [ReminderScheduledTask]) {
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
				.setDescription(task.data.content)
				.setFooter(await message.resolveKey(LanguageKeys.Commands.Social.RemindMeShowFooter, { id: task.id }))
				.setTimestamp(task.time)
		);
	}

	public async delete(message: Message, [task]: [ReminderScheduledTask]) {
		const { id } = task;
		await task.delete();
		return message.sendTranslated(LanguageKeys.Commands.Social.RemindMeDelete, [{ remainingDuration: task.time.getTime() - Date.now(), id }]);
	}
}
