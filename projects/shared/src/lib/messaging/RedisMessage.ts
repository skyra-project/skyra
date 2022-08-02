import type {
	APIChannel,
	APIUser,
	GatewayGuildBanAddDispatchData,
	GatewayGuildBanRemoveDispatchData,
	GatewayMessageCreateDispatchData,
	GatewayMessageReactionAddDispatchData,
	GatewayMessageReactionRemoveAllDispatchData,
	GatewayMessageReactionRemoveDispatchData,
	GatewayMessageReactionRemoveEmojiDispatchData,
	GatewayMessageUpdateDispatchData
} from 'discord-api-types/v10';
import type { Channel } from '../cache/structures/Channel.js';
import type { Emoji } from '../cache/structures/Emoji.js';
import type { Guild } from '../cache/structures/Guild.js';
import type { Member } from '../cache/structures/Member.js';
import type { Message } from '../cache/structures/Message.js';
import type { Role } from '../cache/structures/Role.js';
import type { Sticker } from '../cache/structures/Sticker.js';
import type { MessageBroker } from './MessageBroker.js';

export class RedisMessage {
	public readonly streamId: string;
	public readonly entryId: string;
	public readonly data: RedisMessage.Data;
	private readonly broker: MessageBroker;

	public constructor(broker: MessageBroker, streamId: string, entryId: string, data: RedisMessage.Data) {
		this.broker = broker;
		this.streamId = streamId;
		this.entryId = entryId;
		this.data = data;
	}

	public async ack() {
		const value = await this.broker.redis.xack(this.streamId, this.broker.stream, this.entryId);
		return value > 0;
	}
}

export namespace RedisMessage {
	export type Data =
		| ChannelCreateRedisPayload
		| ChannelDeleteRedisPayload
		| ChannelUpdateRedisPayload
		| EmojiCreateRedisPayload
		| EmojiDeleteRedisPayload
		| EmojiUpdateRedisPayload
		| GuildBanAddRedisPayload
		| GuildBanRemoveRedisPayload
		| GuildUpdateRedisPayload
		| MemberAddRedisPayload
		| MemberRemoveRedisPayload
		| MemberUpdateRedisPayload
		| MessageCreateRedisPayload
		| MessageDeleteBulkRedisPayload
		| MessageDeleteRedisPayload
		| MessageReactionAddRedisPayload
		| MessageReactionRemoveAllRedisPayload
		| MessageReactionRemoveEmojiRedisPayload
		| MessageReactionRemoveRedisPayload
		| MessageUpdateRedisPayload
		| RoleCreateRedisPayload
		| RoleDeleteRedisPayload
		| RoleUpdateRedisPayload
		| StickerCreateRedisPayload
		| StickerDeleteRedisPayload
		| StickerUpdateRedisPayload;
}

export enum RedisMessageType {
	ChannelCreate,
	ChannelDelete,
	ChannelUpdate,
	EmojiCreate,
	EmojiDelete,
	EmojiUpdate,
	GuildBanAdd,
	GuildBanRemove,
	GuildUpdate,
	MemberAdd,
	MemberRemove,
	MemberUpdate,
	MessageCreate,
	MessageDelete,
	MessageDeleteBulk,
	MessageReactionAdd,
	MessageReactionRemove,
	MessageReactionRemoveAll,
	MessageReactionRemoveEmoji,
	MessageUpdate,
	RoleCreate,
	RoleDelete,
	RoleUpdate,
	StickerCreate,
	StickerDelete,
	StickerUpdate
}

export interface IDataRedisPayload<T> {
	data: T;
}

export interface IOldRedisPayload<T> {
	old: T | null;
}

export interface IUpdateRedisPayload<T, N = T> extends IDataRedisPayload<N>, IOldRedisPayload<T> {}

export interface GuildUpdateRedisPayload extends IUpdateRedisPayload<Guild.Json> {
	type: RedisMessageType.GuildUpdate;
}

export interface MessageCreateRedisPayload extends IDataRedisPayload<GatewayMessageCreateDispatchData> {
	type: RedisMessageType.MessageCreate;
}

export interface MessageUpdateRedisPayload extends IUpdateRedisPayload<Message.Json, GatewayMessageUpdateDispatchData> {
	type: RedisMessageType.MessageUpdate;
}

export interface MessageDeleteRedisPayload extends IOldRedisPayload<Message.Json | { id: string; channel_id: string; guild_id: string }> {
	type: RedisMessageType.MessageDelete;
}

export interface MessageDeleteBulkRedisPayload extends IOldRedisPayload<(Message.Json | { id: string })[]> {
	type: RedisMessageType.MessageDeleteBulk;
	channel_id: string;
	guild_id: string;
}

export interface GuildBanAddRedisPayload extends IDataRedisPayload<GatewayGuildBanAddDispatchData> {
	type: RedisMessageType.GuildBanAdd;
}

export interface GuildBanRemoveRedisPayload extends IDataRedisPayload<GatewayGuildBanRemoveDispatchData> {
	type: RedisMessageType.GuildBanRemove;
}

export interface ChannelCreateRedisPayload extends IDataRedisPayload<APIChannel> {
	type: RedisMessageType.ChannelCreate;
}

export interface ChannelUpdateRedisPayload extends IUpdateRedisPayload<Channel.Json, APIChannel> {
	type: RedisMessageType.ChannelUpdate;
}

export interface ChannelDeleteRedisPayload extends IOldRedisPayload<APIChannel> {
	type: RedisMessageType.ChannelDelete;
}

export interface EmojiCreateRedisPayload extends IDataRedisPayload<Emoji.Json> {
	type: RedisMessageType.EmojiCreate;
	guild_id: string;
}

export interface EmojiUpdateRedisPayload extends IUpdateRedisPayload<Emoji.Json> {
	type: RedisMessageType.EmojiUpdate;
	guild_id: string;
}

export interface EmojiDeleteRedisPayload extends IOldRedisPayload<Emoji.Json> {
	type: RedisMessageType.EmojiDelete;
	guild_id: string;
}

export interface MemberAddRedisPayload extends IDataRedisPayload<Member.Json> {
	type: RedisMessageType.MemberAdd;
}

export interface MemberUpdateRedisPayload extends IUpdateRedisPayload<Member.Json> {
	type: RedisMessageType.MemberUpdate;
}

export interface MemberRemoveRedisPayload extends IOldRedisPayload<Member.Json> {
	type: RedisMessageType.MemberRemove;
	user: APIUser;
	guild_id: string;
}

export interface RoleCreateRedisPayload extends IDataRedisPayload<Role.Json> {
	type: RedisMessageType.RoleCreate;
	guild_id: string;
}

export interface RoleUpdateRedisPayload extends IUpdateRedisPayload<Role.Json> {
	type: RedisMessageType.RoleUpdate;
	guild_id: string;
}

export interface RoleDeleteRedisPayload extends IOldRedisPayload<Role.Json | { id: string }> {
	type: RedisMessageType.RoleDelete;
	guild_id: string;
}

export interface MessageReactionAddRedisPayload extends IDataRedisPayload<GatewayMessageReactionAddDispatchData> {
	type: RedisMessageType.MessageReactionAdd;
}

export interface MessageReactionRemoveRedisPayload extends IDataRedisPayload<GatewayMessageReactionRemoveDispatchData> {
	type: RedisMessageType.MessageReactionRemove;
}

export interface MessageReactionRemoveAllRedisPayload extends IDataRedisPayload<GatewayMessageReactionRemoveAllDispatchData> {
	type: RedisMessageType.MessageReactionRemoveAll;
}

export interface MessageReactionRemoveEmojiRedisPayload extends IDataRedisPayload<GatewayMessageReactionRemoveEmojiDispatchData> {
	type: RedisMessageType.MessageReactionRemoveEmoji;
}

export interface StickerCreateRedisPayload extends IDataRedisPayload<Sticker.Json> {
	type: RedisMessageType.StickerCreate;
	guild_id: string;
}

export interface StickerUpdateRedisPayload extends IUpdateRedisPayload<Sticker.Json> {
	type: RedisMessageType.StickerUpdate;
	guild_id: string;
}

export interface StickerDeleteRedisPayload extends IOldRedisPayload<Sticker.Json> {
	type: RedisMessageType.StickerDelete;
	guild_id: string;
}
