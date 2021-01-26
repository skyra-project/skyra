import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { CLIENT_ID } from '#root/config';
import { Moderation } from '#utils/constants';
import { urlRegex } from '#utils/Links/UrlRegex';
import { cleanMentions, floatPromise } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Collection, EmbedField, Guild, Message, MessageAttachment, MessageEmbed, TextChannel, User } from 'discord.js';
import type { TFunction } from 'i18next';

const enum Position {
	Before,
	After
}

const enum Filter {
	Attachments,
	Author,
	Bots,
	Humans,
	Invites,
	Links,
	None,
	Skyra,
	User
}

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['purge', 'nuke', 'sweep'],
	cooldown: 5,
	description: LanguageKeys.Commands.Moderation.PruneDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.PruneExtended,
	permissionLevel: PermissionLevels.Moderator,
	strategyOptions: { flags: ['silent'] },
	permissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'EMBED_LINKS'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const limit = await args.pick('integer', { minimum: 1, maximum: 100 });
		const rawFilter = args.finished ? null : await args.pick(UserCommand.filter).catch(() => args.pick('user'));
		const rawPosition = args.finished ? null : await args.pick(UserCommand.position);
		const targetMessage = args.finished && rawPosition === null ? message : await args.pick('message');

		const position = this.resolvePosition(rawPosition);
		const filter = this.resolveFilter(rawFilter);

		// Fetch the messages
		let messages = (await message.channel.messages.fetch({ limit: 100, [position]: targetMessage.id })) as Collection<string, GuildMessage>;
		if (filter !== Filter.None) {
			const user = filter === Filter.User ? (rawFilter as User) : null;
			messages = messages.filter(this.getFilter(message, filter, user) as (message: Message) => boolean) as Collection<string, GuildMessage>;
		}

		// Filter the messages by their age
		const now = Date.now();
		const filtered = messages.filter((m) => now - m.createdTimestamp < 1209600000);
		if (filtered.size === 0) this.error(LanguageKeys.Commands.Moderation.PruneNoDeletes);

		// Perform a bulk delete, throw if it returns unknown message.
		const filteredKeys = this.resolveKeys([...filtered.keys()], position, limit);
		await (message.channel as TextChannel).bulkDelete(filteredKeys).catch((error) => {
			if (error.code !== RESTJSONErrorCodes.UnknownMessage) throw error;
		});

		// Send prune logs and reply to the channel
		floatPromise(this.sendPruneLogs(message, args.t, filtered, filteredKeys));
		return args.getFlags('silent')
			? null
			: message.alert(args.t(LanguageKeys.Commands.Moderation.PruneAlert, { count: filteredKeys.length, total: limit }));
	}

	private resolveKeys(messages: readonly string[], position: 'before' | 'after', limit: number) {
		return position === 'before' ? messages.slice(0, limit) : messages.slice(messages.length - limit, messages.length);
	}

	private getFilter(message: GuildMessage, filter: Filter, user: User | null) {
		switch (filter) {
			case Filter.Attachments:
				return (mes: GuildMessage) => mes.attachments.size > 0;
			case Filter.Author:
				return (mes: GuildMessage) => mes.author.id === message.author.id;
			case Filter.Bots:
				return (mes: GuildMessage) => mes.author.bot;
			case Filter.Humans:
				return (mes: GuildMessage) => mes.author.id === message.author.id;
			case Filter.Invites:
				return (mes: GuildMessage) => UserCommand.kInviteRegExp.test(mes.content);
			case Filter.Links:
				return (mes: GuildMessage) => UserCommand.kLinkRegExp.test(mes.content);
			case Filter.Skyra:
				return (mes: GuildMessage) => mes.author.id === CLIENT_ID;
			case Filter.User:
				return (mes: GuildMessage) => mes.author.id === user!.id;
			default:
				return () => true;
		}
	}

	private resolveFilter(filter: Filter | User | null) {
		return filter === null ? Filter.None : filter instanceof User ? Filter.User : filter;
	}

	private resolvePosition(position: Position | null) {
		return position === Position.After ? 'after' : 'before';
	}

	private async sendPruneLogs(message: GuildMessage, t: TFunction, messages: Collection<string, GuildMessage>, rawMessages: readonly string[]) {
		const channelID = await message.guild.readSettings(GuildSettings.Channels.PruneLogs);
		if (isNullish(channelID)) return;

		const channel = message.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (typeof channel === 'undefined') {
			await message.guild.writeSettings([[GuildSettings.Channels.PruneLogs, null]]);
			return;
		}

		if (channel.attachable) {
			// Filter the messages collection by the deleted messages, so no extras are added.
			messages = messages.filter((_, key) => rawMessages.includes(key));

			// Send the message to the prune logs channel.
			await channel.send('', {
				embed: new MessageEmbed()
					.setAuthor(
						`${message.author.tag} (${message.author.id})`,
						message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
					)
					.setDescription(
						t(LanguageKeys.Commands.Moderation.PruneLogMessage, {
							channel: (message.channel as TextChannel).toString(),
							author: message.author.toString(),
							count: messages.size
						})
					)
					.setColor(UserCommand.kColor)
					.setTimestamp(),
				files: [this.generateAttachment(t, messages)]
			});
		}
	}

	private generateAttachment(t: TFunction, messages: Collection<string, GuildMessage>) {
		const header = t(LanguageKeys.Commands.Moderation.PruneLogHeader);
		const processed = messages
			.map((message) => this.formatMessage(t, message))
			.reverse()
			.join('\n\n');
		const buffer = Buffer.from(`${header}\n\n${processed}`);
		return new MessageAttachment(buffer, 'prune.txt');
	}

	private formatMessage(t: TFunction, message: GuildMessage) {
		const header = this.formatHeader(t, message);
		const content = this.formatContents(message);
		return `${header}\n${content}`;
	}

	private formatHeader(t: TFunction, message: GuildMessage) {
		return `${this.formatTimestamp(t, message.createdTimestamp)} ${message.system ? 'SYSTEM' : this.formatAuthor(message.author)}`;
	}

	private formatTimestamp(t: TFunction, timestamp: number) {
		return `[${t(LanguageKeys.Globals.DateTimeValue, { value: timestamp })}]`;
	}

	private formatAuthor(author: User) {
		return `${author.tag}${author.bot ? ' [BOT]' : ''}`;
	}

	private formatContents(message: GuildMessage) {
		const output: string[] = [];
		if (message.content.length > 0) output.push(this.formatContent(message.guild, message.content));
		if (message.embeds.length > 0) output.push(message.embeds.map((embed) => this.formatEmbed(message.guild, embed)).join('\n'));
		if (message.attachments.size > 0) output.push(message.attachments.map((attachment) => this.formatAttachment(attachment)).join('\n'));
		return output.join('\n');
	}

	private formatContent(guild: Guild, content: string) {
		return cleanMentions(guild, content)
			.split('\n')
			.map((line) => `> ${line}`)
			.join('\n');
	}

	private formatAttachment(attachment: MessageAttachment) {
		return `📂 [${attachment.name}: ${attachment.url}]`;
	}

	private formatEmbed(guild: Guild, embed: MessageEmbed) {
		switch (embed.type) {
			case 'video':
				return this.formatEmbedVideo(embed);
			case 'image':
				return this.formatEmbedImage(embed);
			default:
				return this.formatEmbedRich(guild, embed);
		}
	}

	private formatEmbedVideo(embed: MessageEmbed) {
		return `📹 [${embed.url}]${embed.provider ? ` From ${embed.provider.name}.` : ''}`;
	}

	private formatEmbedImage(embed: MessageEmbed) {
		return `🖼️ [${embed.url}]${embed.provider ? ` From ${embed.provider.name}.` : ''}`;
	}

	private formatEmbedRich(guild: Guild, embed: MessageEmbed) {
		if (typeof embed.provider === 'undefined') {
			const output: string[] = [];
			if (embed.title) output.push(this.formatEmbedRichTitle(embed.title));
			if (embed.author) output.push(this.formatEmbedRichAuthor(embed.author));
			if (embed.url) output.push(this.formatEmbedRichUrl(embed.url));
			if (embed.description) output.push(this.formatEmbedRichDescription(guild, embed.description));
			if (embed.fields.length > 0) output.push(embed.fields.map((field) => this.formatEmbedRichField(guild, field)).join('\n'));
			return output.join('\n');
		}

		return this.formatEmbedRichProvider(embed);
	}

	private formatEmbedRichTitle(title: string) {
		return `># ${title}`;
	}

	private formatEmbedRichUrl(url: string) {
		return `> 📎 ${url}`;
	}

	private formatEmbedRichAuthor(author: Exclude<MessageEmbed['author'], null>) {
		return `> 👤 ${author.name || '-'}${author.iconURL ? ` [${author.iconURL}]` : ''}${author.url ? ` <${author.url}>` : ''}`;
	}

	private formatEmbedRichDescription(guild: Guild, description: string) {
		return cleanMentions(guild, description)
			.split('\n')
			.map((line) => `> > ${line}`)
			.join('\n');
	}

	private formatEmbedRichField(guild: Guild, field: EmbedField) {
		return `> #> ${field.name}\n${cleanMentions(guild, field.value)
			.split('\n')
			.map((line) => `>  > ${line}`)
			.join('\n')}`;
	}

	private formatEmbedRichProvider(embed: MessageEmbed) {
		return `🔖 [${embed.url}]${embed.provider ? ` From ${embed.provider.name}.` : ''}`;
	}

	private static filter = Args.make<Filter>((parameter, { argument }) => {
		const filter = this.kCommandPruneFilters[parameter.toLowerCase()];
		if (typeof filter === 'undefined') {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Moderation.PruneInvalidFilter });
		}

		return Args.ok(filter);
	});

	private static position = Args.make<Position>((parameter, { argument }) => {
		const position = this.kCommandPrunePositions[parameter.toLowerCase()];
		if (typeof position === 'undefined') {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Moderation.PruneInvalidPosition });
		}

		return Args.ok(position);
	});

	private static readonly kColor = Moderation.metadata.get(Moderation.TypeCodes.Prune)!.color;
	private static readonly kInviteRegExp = /(?:discord\.(?:gg|io|me|plus|link)|invite\.(?:gg|ink)|discord(?:app)?\.com\/invite)\/(?:[\w-]{2,})/i;
	private static readonly kLinkRegExp = urlRegex({ requireProtocol: true, tlds: true });
	private static readonly kCommandPrunePositions: Record<string, Position> = {
		before: Position.Before,
		b: Position.Before,
		after: Position.After,
		a: Position.After
	};

	private static readonly kCommandPruneFilters: Record<string, Filter> = {
		file: Filter.Attachments,
		files: Filter.Attachments,
		upload: Filter.Attachments,
		uploads: Filter.Attachments,
		author: Filter.Author,
		me: Filter.Author,
		bot: Filter.Bots,
		bots: Filter.Bots,
		human: Filter.Humans,
		humans: Filter.Humans,
		invite: Filter.Invites,
		invites: Filter.Invites,
		link: Filter.Links,
		links: Filter.Links,
		skyra: Filter.Skyra,
		you: Filter.Skyra
	};
}
