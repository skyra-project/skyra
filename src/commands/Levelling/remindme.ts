import { ScheduleEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { Schedules } from '#lib/types/Enums';
import { Time } from '#utils/constants';
import { requiresGuildContext, requiresPermissions } from '#utils/decorators';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { chunk, cutText } from '@sapphire/utilities';
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
	aliases: ['rmm', 'remind', 'reminder', 'reminders'],
	bucket: 2,
	cooldown: 30,
	description: LanguageKeys.Commands.Social.RemindMeDescription,
	extendedHelp: LanguageKeys.Commands.Social.RemindMeExtended
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const action = args.finished ? Actions.List : await args.pick(UserCommand.action).catch(() => Actions.Create);
		return this[action](message, args);
	}

	public async create(message: Message, args: SkyraCommand.Args) {
		const duration = await args.pick('timespan', { minimum: Time.Minute });
		const description = args.finished
			? args.t(LanguageKeys.Commands.Social.RemindMeCreateNoDescription)
			: await args.rest('string', { maximum: 1024 });

		const task = await this.context.schedule.add(Schedules.Reminder, Date.now() + duration, {
			catchUp: true,
			data: {
				content: description,
				user: message.author.id
			}
		});

		return message.send(args.t(LanguageKeys.Commands.Social.RemindMeCreate, { id: task.id.toString() }));
	}

	@requiresGuildContext((message: Message, args: SkyraCommand.Args) => message.send(args.t(LanguageKeys.Preconditions.GuildOnly)))
	@requiresPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async list(message: Message, args: SkyraCommand.Args) {
		const { client } = this.context;
		const tasks = client.schedules.queue.filter((task) => task.data && task.data.user === message.author.id);
		if (!tasks.length) return message.send(args.t(LanguageKeys.Commands.Social.RemindMeListEmpty));
		const response = await sendLoadingMessage(message, args.t);

		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setAuthor(client.user!.username, client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
		});

		const pages = chunk(
			tasks.map(
				(task) =>
					`\`${task.id}\` - \`${args.t(LanguageKeys.Globals.DateTimeValue, { value: task.time })}\` - ${cutText(
						task.data.content as string,
						40
					)}`
			),
			10
		);

		for (const page of pages) display.addPageEmbed((template) => template.setDescription(page.join('\n')));
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	public async delete(message: Message, args: SkyraCommand.Args) {
		const task = await args.pick(UserCommand.task);
		const { id } = task;
		await task.delete();

		return message.send(args.t(LanguageKeys.Commands.Social.RemindMeDelete, { remainingDuration: task.time.getTime() - Date.now(), id }));
	}

	@requiresPermissions(['EMBED_LINKS'])
	public async show(message: Message, args: SkyraCommand.Args) {
		const task = await args.pick(UserCommand.task);

		return message.send(
			new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
				.setDescription(task.data.content)
				.setFooter(args.t(LanguageKeys.Commands.Social.RemindMeShowFooter, { id: task.id }))
				.setTimestamp(task.time)
		);
	}

	private static action = Args.make<Actions>((parameter, { argument }) => {
		switch (parameter.toLowerCase()) {
			case 'a':
			case 'all':
			case 'l':
			case 'list':
				return Args.ok(Actions.List);
			case 'r':
			case 'rm':
			case 'remove':
			case 'd':
			case 'del':
			case 'delete':
				return Args.ok(Actions.Delete);
			case 's':
			case 'show':
				return Args.ok(Actions.Show);
			case 'c':
			case 'create':
			case 'me':
				return Args.ok(Actions.Create);
			default: {
				return Args.error({ argument, parameter });
			}
		}
	});

	private static task = Args.make<ReminderScheduledTask>((parameter, { message, argument }) => {
		const id = Number(parameter);
		if (!Number.isInteger(id) || id < 0) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Social.RemindMeInvalidId });
		}

		for (const task of message.client.schedules.queue) {
			// If it is not the task we are looking for, skip:
			if (task.id !== id) continue;

			// If the specified task is:
			// - Not a reminder.
			// - Does not belong to the user.
			//
			// Then it should break the loop and return err.
			if (task.taskID !== Schedules.Reminder || task.data.user !== message.author.id) break;

			// But if the task is a valid one, is a reminder, and is owned by the author, then emit ok():
			return Args.ok(task as ReminderScheduledTask);
		}

		return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Social.RemindMeNotFound });
	});
}
