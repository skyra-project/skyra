import { GuildMessage } from '#lib/types';
import { MessageBuilder, PaginatedMessage, PaginatedMessageOptions } from '@sapphire/discord.js-utilities';
import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v6';
import { APIMessage, MessageEmbed, MessageEmbedOptions, MessageOptions, MessageReaction, NewsChannel, TextChannel, User } from 'discord.js';

export class UserPaginatedMessage extends PaginatedMessage {
	public template: MessageOptions;

	public constructor(options: UserPaginatedMessage.Options = {}) {
		super(options);
		this.template = UserPaginatedMessage.resolveTemplate(options.template);
	}

	// TODO: Remove this once the fix has landed upstream
	/**
	 * This executes the [[PaginatedMessage]] and sends the pages corresponding with [[PaginatedMessage.index]].
	 * The handler will start collecting reactions and running actions once all actions have been reacted to the message.
	 * @param author The author to validate.
	 * @param channel The channel to use.
	 */
	public async run(author: User, channel: TextChannel | NewsChannel) {
		await this.resolvePagesOnRun(channel);

		if (!this.messages.length) throw new Error('There are no messages.');
		if (!this.actions.size) throw new Error('There are no messages.');

		const firstPage = this.messages[this.index]!;

		if (this.response) await this.response.edit(firstPage);
		else this.response = (await channel.send(firstPage)) as GuildMessage;

		for (const id of this.actions.keys()) await this.response.react(id);

		this.collector ??= this.response
			.createReactionCollector(
				(reaction: MessageReaction, user: User) =>
					(this.actions.has(reaction.emoji.identifier) || this.actions.has(reaction.emoji.name)) && user.id === author.id,
				{ idle: this.idle }
			)
			.on('collect', this.handleCollect.bind(this, author, channel))
			.on('end', this.handleEnd.bind(this));

		return this;
	}

	public async start(message: GuildMessage, target = message.author): Promise<this> {
		// Stop the previous display and cache the new one
		const display = UserPaginatedMessage.handlers.get(target.id);
		if (display) display.collector!.stop();

		// If the message was sent by Skyra, set the response as this one
		if (message.author.bot) this.response = message;

		const handler = await this.run(target, message.channel);
		const messageID = handler.response!.id;

		this.collector!.once('end', () => {
			UserPaginatedMessage.messages.delete(messageID);
			UserPaginatedMessage.handlers.delete(target.id);
		});

		UserPaginatedMessage.messages.set(messageID, handler);
		UserPaginatedMessage.handlers.set(target.id, handler);

		return handler;
	}

	/**
	 * This clones the current handler into a new instance.
	 */
	public clone() {
		const clone = new UserPaginatedMessage({ pages: this.pages, actions: [], template: this.template }).setIndex(this.index).setIdle(this.idle);
		clone.actions = this.actions;
		clone.response = this.response;
		clone.collector = this.collector;
		return clone;
	}

	public addPageBuilder(cb: (builder: MessageBuilder) => MessageBuilder): this {
		return this.addPage(cb(new MessageBuilder()));
	}

	public addPageEmbed(cb: (builder: MessageEmbed) => MessageEmbed): this {
		return this.addPage({ embed: cb(new MessageEmbed()) });
	}

	/**
	 * This function is executed whenever an action is triggered and resolved.
	 * @param index The index to resolve.
	 */
	public async resolvePage(channel: TextChannel | NewsChannel, index: number): Promise<APIMessage> {
		const message = this.messages[index];
		if (message !== null) return message;

		const page = this.pages[index];
		const options = typeof page === 'function' ? await page(index, this.pages, this) : page;
		const resolved = options instanceof APIMessage ? options : new APIMessage(channel, this.applyTemplate(options));
		const transformed = this.applyFooter(resolved.resolveData(), index);
		this.messages[index] = transformed;

		return transformed;
	}

	private applyFooter(message: APIMessage, index: number): APIMessage {
		const templateSuffix = this.template.embed?.footer?.text ?? '';

		const data = message.data as RESTPostAPIChannelMessageJSONBody;
		if (!data.embed) return message;

		data.embed.footer ??= { text: '' };
		data.embed.footer.text = `${index + 1} / ${this.pages.length}${data.embed.footer.text}${templateSuffix}`;
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
