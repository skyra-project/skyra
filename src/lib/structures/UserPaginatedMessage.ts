import { GuildMessage } from '#lib/types';
import { PaginatedMessage, PaginatedMessageOptions } from '@sapphire/discord.js-utilities';
import { APIMessage, MessageEmbed } from 'discord.js';

export class UserPaginatedMessage extends PaginatedMessage {
	public template: MessageEmbed;

	public constructor(options: UserPaginatedMessageOptions = {}) {
		super(options);
		this.template = options.template ?? new MessageEmbed();
	}

	public async start(message: GuildMessage, targetID = message.author.id): Promise<UserPaginatedMessage> {
		// Stop the previous display and cache the new one
		const display = UserPaginatedMessage.handlers.get(targetID);
		if (display) display.collector!.stop();

		// If the message was sent by Skyra, set the response as this one
		// if (message.author.bot) this.response = message;

		const handler = await super.run(message.author, message.channel);
		const messageID = handler.response!.id;

		this.collector!.once('end', () => {
			UserPaginatedMessage.messages.delete(messageID);
			UserPaginatedMessage.handlers.delete(targetID);
		});

		UserPaginatedMessage.messages.set(messageID, handler);
		UserPaginatedMessage.handlers.set(targetID, handler);

		return handler;
	}

	public addTemplatedEmbedPage(embedOrCallback: EmbedMessageTemplate) {
		const embed = typeof embedOrCallback === 'function' ? embedOrCallback(new MessageEmbed(this.template)) : embedOrCallback;
		return this.addPage(new APIMessage(null!, embed).resolveData());
	}

	/**
	 * This clones the current handler into a new instance.
	 */
	public clone(): UserPaginatedMessage {
		const clone = new UserPaginatedMessage({ pages: this.pages, actions: [], template: this.template }).setIndex(this.index).setIdle(this.idle);
		clone.actions = this.actions;
		return clone;
	}

	public static readonly messages = new Map<string, UserPaginatedMessage>();
	public static readonly handlers = new Map<string, UserPaginatedMessage>();
}

export type EmbedMessageTemplate = ((template: MessageEmbed) => MessageEmbed) | MessageEmbed;

export interface UserPaginatedMessageOptions extends PaginatedMessageOptions {
	template?: MessageEmbed;
}
