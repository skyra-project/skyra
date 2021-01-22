import { GuildMessage } from '#lib/types';
import { MessageBuilder, MessagePage, PaginatedMessage, PaginatedMessageOptions } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/time-utilities';
import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v6';
import { APIMessage, MessageEmbed, MessageEmbedOptions, MessageOptions, NewsChannel, TextChannel, User } from 'discord.js';

export class UserPaginatedMessage extends PaginatedMessage {
	public template: MessageOptions;

	public constructor(options: UserPaginatedMessage.Options = {}) {
		super(options);
		this.setIdle(Time.Minute * 5);
		this.template = UserPaginatedMessage.resolveTemplate(options.template);
	}

	public async start(message: GuildMessage, target = message.author): Promise<this> {
		// Stop the previous display and cache the new one
		const display = UserPaginatedMessage.handlers.get(target.id);
		if (display) display.collector!.stop();

		// If the message was sent by Skyra, set the response as this one
		if (message.author.bot) this.response = message;

		const handler = await this.run(target, message.channel);
		const messageID = handler.response!.id;

		if (this.collector) {
			this.collector!.once('end', () => {
				UserPaginatedMessage.messages.delete(messageID);
				UserPaginatedMessage.handlers.delete(target.id);
			});

			UserPaginatedMessage.messages.set(messageID, handler);
			UserPaginatedMessage.handlers.set(target.id, handler);
		}

		return handler;
	}

	/**
	 * This clones the current handler into a new instance.
	 */
	public clone(): UserPaginatedMessage {
		const clone = super.clone() as UserPaginatedMessage;
		clone.template = this.template;
		return clone;
	}

	public addPageBuilder(cb: (builder: MessageBuilder) => MessageBuilder): this {
		return this.addPage(cb(new MessageBuilder()));
	}

	public addPageEmbed(cb: (builder: MessageEmbed) => MessageEmbed): this {
		return this.addPage({ embed: cb(new MessageEmbed()) });
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
		const resolved = options instanceof APIMessage ? options : new APIMessage(channel, this.applyTemplate(options));
		return this.applyFooter(resolved.resolveData(), index);
	}

	private applyFooter(message: APIMessage, index: number): APIMessage {
		const data = message.data as RESTPostAPIChannelMessageJSONBody;
		if (!data.embed) return message;

		data.embed.footer ??= { text: this.template.embed?.footer?.text ?? '' };
		data.embed.footer.text = `${index + 1} / ${this.pages.length}${data.embed.footer.text}`;
		return message;
	}

	private applyTemplate(options: MessageOptions): MessageOptions {
		return { ...this.template, ...options, embed: this.applyTemplateEmbed(options.embed) };
	}

	private applyTemplateEmbed(embed: MessageOptions['embed']): MessageEmbed | MessageEmbedOptions | undefined {
		if (!embed) return this.template.embed;
		if (!this.template.embed) return embed;
		return this.mergeEmbeds(this.template.embed, embed);
	}

	private mergeEmbeds(template: MessageEmbed | MessageEmbedOptions, embed: MessageEmbed | MessageEmbedOptions): MessageEmbedOptions {
		return {
			title: embed.title ?? template.title ?? undefined,
			description: embed.description ?? template.description ?? undefined,
			url: embed.url ?? template.url ?? undefined,
			timestamp: embed.timestamp ?? template.timestamp ?? undefined,
			color: embed.color ?? template.color ?? undefined,
			fields: this.mergeArrays(template.fields, embed.fields),
			files: this.mergeArrays(template.files, embed.files),
			author: embed.author ?? template.author ?? undefined,
			thumbnail: embed.thumbnail ?? template.thumbnail ?? undefined,
			image: embed.image ?? template.image ?? undefined,
			video: embed.video ?? template.video ?? undefined,
			footer: embed.footer ?? template.footer ?? undefined
		};
	}

	private mergeArrays<T>(template?: T[], array?: T[]): undefined | T[] {
		if (!array) return template;
		if (!template) return array;
		return [...template, ...array];
	}

	public static readonly messages = new Map<string, UserPaginatedMessage>();
	public static readonly handlers = new Map<string, UserPaginatedMessage>();

	private static resolveTemplate(template?: MessageEmbed | MessageOptions): MessageOptions {
		if (template === undefined) return {};
		if (template instanceof MessageEmbed) return { embed: template };
		return template;
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserPaginatedMessage {
	export interface Options extends PaginatedMessageOptions {
		template?: MessageEmbed | MessageOptions;
	}
}
