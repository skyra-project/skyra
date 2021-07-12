import type { GuildMessage } from '#lib/types';
import { LazyPaginatedMessage, MessageBuilder, MessagePage, PaginatedMessageOptions } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/time-utilities';
import type { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v6';
import { APIMessage, MessageEmbed, MessageOptions, NewsChannel, TextChannel, User } from 'discord.js';
import { applyTemplate } from './utils/templates';

export class UserLazyPaginatedMessage extends LazyPaginatedMessage {
	public template: MessageOptions;

	public constructor(options: UserLazyPaginatedMessage.Options = {}) {
		super(options);
		this.setIdle(Time.Minute * 5);
		this.template = UserLazyPaginatedMessage.resolveTemplate(options.template);
	}

	public async start(message: GuildMessage, target = message.author): Promise<this> {
		// Stop the previous display and cache the new one
		const display = UserLazyPaginatedMessage.handlers.get(target.id);
		if (display) display.collector!.stop();

		// If the message was sent by Skyra, set the response as this one
		if (message.author.bot) this.response = message;

		const handler = await this.run(target, message.channel);
		const messageID = handler.response!.id;

		if (this.collector) {
			this.collector!.once('end', () => {
				UserLazyPaginatedMessage.messages.delete(messageID);
				UserLazyPaginatedMessage.handlers.delete(target.id);
			});

			UserLazyPaginatedMessage.messages.set(messageID, handler);
			UserLazyPaginatedMessage.handlers.set(target.id, handler);
		}

		return handler;
	}

	/**
	 * This clones the current handler into a new instance.
	 */
	public clone(): UserLazyPaginatedMessage {
		const clone = super.clone() as UserLazyPaginatedMessage;
		clone.template = this.template;
		return clone;
	}

	public addPageBuilder(cb: (builder: MessageBuilder) => MessageBuilder): this {
		return this.addPage(cb(new MessageBuilder()));
	}

	public addPageContent(content: string): this {
		return this.addPage({ content });
	}

	public addPageEmbed(cb: MessageEmbed | ((builder: MessageEmbed) => MessageEmbed)): this {
		return this.addPage(() => ({ embed: typeof cb === 'function' ? cb(new MessageEmbed()) : cb }));
	}

	public addAsyncPageEmbed(cb: MessageEmbed | ((builder: MessageEmbed) => Promise<MessageEmbed>)): this {
		return this.addPage(async () => ({ embed: typeof cb === 'function' ? await cb(new MessageEmbed()) : cb }));
	}

	/**
	 * Sets up the message's reactions and the collector.
	 * @param channel The channel the handler is running at.
	 * @param author The author the handler is for.
	 */
	protected async setUpReactions(channel: TextChannel | NewsChannel, author: User): Promise<void> {
		if (this.pages.length > 1) await super.setUpReactions(channel, author);
	}

	/**
	 * Handles the load of a page.
	 * @param page The page to be loaded.
	 * @param channel The channel the paginated message runs at.
	 * @param index The index of the current page.
	 */
	protected async handlePageLoad(page: MessagePage, channel: TextChannel | NewsChannel, index: number): Promise<APIMessage> {
		const options = typeof page === 'function' ? await page(index, this.pages, this) : page;
		const resolved = options instanceof APIMessage ? options : new APIMessage(channel, applyTemplate(this.template, options));
		return this.applyFooter(resolved.resolveData(), index);
	}

	private applyFooter(message: APIMessage, index: number): APIMessage {
		const data = message.data as RESTPostAPIChannelMessageJSONBody;
		if (!data.embed) return message;

		data.embed.footer ??= { text: this.template.embed?.footer?.text ?? '' };
		data.embed.footer.text = `${index + 1} / ${this.pages.length}${data.embed.footer.text}`;
		return message;
	}

	public static readonly messages = new Map<string, UserLazyPaginatedMessage>();
	public static readonly handlers = new Map<string, UserLazyPaginatedMessage>();

	private static resolveTemplate(template?: MessageEmbed | MessageOptions): MessageOptions {
		if (template === undefined) return {};
		if (template instanceof MessageEmbed) return { embed: template };
		return template;
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserLazyPaginatedMessage {
	export interface Options extends PaginatedMessageOptions {
		template?: MessageEmbed | MessageOptions;
	}
}
