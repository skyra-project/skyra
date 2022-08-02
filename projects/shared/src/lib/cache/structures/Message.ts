import type { Nullish } from '@sapphire/utilities';
import type { APIAttachment, APIEmbed, APIEmbedAuthor, APIMessage } from 'discord-api-types/v10';
import { fromTimestamp, normalizeArray, normalizeNullable, normalizeOptional, toTimestamp } from '../../common/util.js';
import type { Reader } from '../../data/Reader.js';
import { Writer } from '../../data/Writer.js';
import type { IStructure } from './interfaces/IStructure.js';

export class Message implements IStructure {
	public readonly id: bigint;
	public readonly channelId: bigint;
	public readonly author: Message.DataUser;
	public readonly content: string;
	public readonly attachments: Message.DataAttachment[];
	public readonly embeds: Message.DataEmbed[];

	public constructor(data: Message.Data) {
		this.id = data.id;
		this.channelId = data.channelId;
		this.author = data.author;
		this.content = data.content;
		this.attachments = data.attachments ?? [];
		this.embeds = data.embeds ?? [];
	}

	public toBuffer(): Buffer {
		return new Writer(400)
			.u64(this.id)
			.u64(this.channelId)
			.object(this.author, (buffer, value) => buffer.u64(value.id).string(value.username).u16(value.discriminator).string(value.avatar))
			.string(this.content)
			.array(this.attachments, (buffer, value) => buffer.u64(value.id).string(value.name).string(value.url))
			.array(this.embeds, (buffer, value) =>
				buffer
					.object(value.author, (buffer, author) => buffer.string(author.name).string(author.icon).string(author.url))
					.string(value.description)
					.array(value.fields, (buffer, value) => buffer.string(value.name).string(value.value))
					.object(value.footer, (buffer, value) => buffer.string(value.text).string(value.icon))
					.object(value.image, (buffer, value) => buffer.string(value.url))
					.object(value.thumbnail, (buffer, value) => buffer.string(value.url))
					.date(value.timestamp)
					.string(value.title)
					.string(value.url)
			).trimmed;
	}

	public toJSON(): Message.Json {
		return {
			id: this.id.toString(),
			channel_id: this.channelId.toString(),
			author: {
				id: this.author.id.toString(),
				username: this.author.username,
				discriminator: this.author.discriminator.toString().padStart(4, '0'),
				avatar: this.author.avatar ?? null
			},
			content: this.content,
			attachments: this.attachments.map((entry) => ({
				id: entry.id.toString(),
				filename: entry.name,
				url: entry.url
			})),
			embeds: this.embeds.map(
				(entry): APIEmbed => ({
					author: normalizeOptional(
						entry.author,
						(entry): APIEmbedAuthor => ({
							name: entry.name,
							icon_url: entry.icon ?? undefined,
							url: entry.url ?? undefined
						})
					),
					description: entry.description ?? undefined,
					fields: entry.fields ?? undefined,
					footer: entry.footer ?? undefined,
					image: entry.image ?? undefined,
					thumbnail: entry.thumbnail ?? undefined,
					timestamp: fromTimestamp(entry.timestamp) ?? undefined,
					title: entry.title ?? undefined,
					url: entry.url ?? undefined
				})
			)
		};
	}

	public static fromAPI(data: Message.Json): Message {
		return new Message({
			id: BigInt(data.id!),
			channelId: BigInt(data.channel_id),
			author: {
				id: BigInt(data.author.id),
				username: data.author.username,
				discriminator: Number(data.author.discriminator),
				avatar: data.author.avatar
			},
			content: data.content,
			attachments: data.attachments.map((attachment) => ({
				id: BigInt(attachment.id),
				name: attachment.filename,
				url: attachment.url
			})),
			embeds: data.embeds.map(
				(embed): Message.DataEmbed => ({
					author: normalizeNullable(
						embed.author,
						(author): Message.DataEmbedAuthor => ({ name: author.name, icon: author.icon_url, url: author.url })
					),
					description: embed.description,
					fields: normalizeArray(embed.fields, (field): Message.DataEmbedField => ({ name: field.name, value: field.value })),
					footer: normalizeNullable(embed.footer, (footer): Message.DataEmbedFooter => ({ text: footer.text, icon: footer.icon_url })),
					image: normalizeNullable(embed.image, (image): Message.DataEmbedImage => ({ url: image.url })),
					thumbnail: normalizeNullable(embed.thumbnail, (thumbnail): Message.DataEmbedThumbnail => ({ url: thumbnail.url })),
					timestamp: toTimestamp(embed.timestamp),
					title: embed.title,
					url: embed.url
				})
			)
		});
	}

	public static fromBinary(reader: Reader): Message {
		return new Message({
			id: reader.u64()!,
			channelId: reader.u64()!,
			author: reader.object((reader) => ({
				id: reader.u64()!,
				username: reader.string()!,
				discriminator: reader.u16()!,
				avatar: reader.string()
			}))!,
			content: reader.string()!,
			attachments: reader.array((reader) => ({
				id: reader.u64()!,
				name: reader.string()!,
				url: reader.string()!
			}))!,
			embeds: reader.array(
				(reader): Message.DataEmbed => ({
					author: reader.object(
						(reader): Message.DataEmbedAuthor => ({ name: reader.string()!, icon: reader.string(), url: reader.string() })
					),
					description: reader.string(),
					fields: reader.array((reader): Message.DataEmbedField => ({ name: reader.string()!, value: reader.string()! })),
					footer: reader.object((reader): Message.DataEmbedFooter => ({ text: reader.string()!, icon: reader.string() })),
					image: reader.object((reader): Message.DataEmbedImage => ({ url: reader.string()! })),
					thumbnail: reader.object((reader): Message.DataEmbedThumbnail => ({ url: reader.string()! })),
					timestamp: reader.date(),
					title: reader.string(),
					url: reader.string()
				})
			)
		});
	}
}

export namespace Message {
	export interface Json extends Pick<APIMessage, 'id' | 'channel_id' | 'author' | 'content' | 'embeds'> {
		attachments: Pick<APIAttachment, 'id' | 'filename' | 'url'>[];
	}

	export interface Data {
		id: bigint;
		channelId: bigint;
		author: DataUser;
		content: string;
		attachments?: DataAttachment[] | Nullish;
		embeds?: DataEmbed[] | Nullish;
	}

	export interface DataUser {
		id: bigint;
		username: string;
		discriminator: number;
		avatar?: string | Nullish;
	}

	export interface DataAttachment {
		id: bigint;
		name: string;
		url: string;
	}

	export interface DataEmbed {
		author?: DataEmbedAuthor | Nullish;
		description?: string | Nullish;
		fields?: DataEmbedField[] | Nullish;
		footer?: DataEmbedFooter | Nullish;
		image?: DataEmbedImage | Nullish;
		thumbnail?: DataEmbedThumbnail | Nullish;
		timestamp?: number | Nullish;
		title?: string | Nullish;
		url?: string | Nullish;
	}

	export interface DataEmbedFooter {
		text: string;
		icon?: string | Nullish;
	}

	export interface DataEmbedImage {
		url: string;
	}

	export interface DataEmbedThumbnail {
		url: string;
	}

	export interface DataEmbedAuthor {
		name: string;
		url?: string | Nullish;
		icon?: string | Nullish;
	}

	export interface DataEmbedField {
		name: string;
		value: string;
	}
}
