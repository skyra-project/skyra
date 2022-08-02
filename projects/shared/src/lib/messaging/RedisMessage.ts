import type {
	GatewayGuildBanAddDispatchData,
	GatewayGuildBanRemoveDispatchData,
	GatewayMessageReactionAddDispatchData,
	GatewayMessageReactionRemoveAllDispatchData,
	GatewayMessageReactionRemoveDispatchData
} from 'discord-api-types/v10';
import type { Channel } from '../cache/structures/Channel.js';
import type { Emoji } from '../cache/structures/Emoji.js';
import type { Guild } from '../cache/structures/Guild.js';
import type { Member } from '../cache/structures/Member.js';
import type { Message } from '../cache/structures/Message.js';
import type { Role } from '../cache/structures/Role.js';
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
		| MemberCreateRedisPayload
		| MemberDeleteRedisPayload
		| MemberUpdateRedisPayload
		| MessageCreateRedisPayload
		| MessageDeleteRedisPayload
		| MessageReactionAddRedisPayload
		| MessageReactionRemoveAllRedisPayload
		| MessageReactionRemoveRedisPayload
		| MessageUpdateRedisPayload
		| RoleCreateRedisPayload
		| RoleDeleteRedisPayload
		| RoleUpdateRedisPayload;
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
	MemberCreate,
	MemberDelete,
	MemberUpdate,
	MessageCreate,
	MessageDelete,
	MessageReactionAdd,
	MessageReactionRemove,
	MessageReactionRemoveAll,
	MessageUpdate,
	RoleCreate,
	RoleDelete,
	RoleUpdate
}

export interface IDataRedisPayload<T> {
	data: T;
}

export interface IOldRedisPayload<T> {
	old: T | null;
}

export interface IUpdateRedisPayload<T> extends IDataRedisPayload<T>, IOldRedisPayload<T> {}

export interface GuildUpdateRedisPayload extends IUpdateRedisPayload<Guild> {
	type: RedisMessageType.GuildUpdate;
}

export interface MessageCreateRedisPayload extends IDataRedisPayload<Message> {
	type: RedisMessageType.MessageCreate;
}

export interface MessageUpdateRedisPayload extends IUpdateRedisPayload<Message> {
	type: RedisMessageType.MessageUpdate;
}

export interface MessageDeleteRedisPayload extends IOldRedisPayload<Message> {
	type: RedisMessageType.MessageDelete;
}

export interface GuildBanAddRedisPayload extends IDataRedisPayload<GatewayGuildBanAddDispatchData> {
	type: RedisMessageType.GuildBanAdd;
}

export interface GuildBanRemoveRedisPayload extends IDataRedisPayload<GatewayGuildBanRemoveDispatchData> {
	type: RedisMessageType.GuildBanRemove;
}

export interface ChannelCreateRedisPayload extends IDataRedisPayload<Channel> {
	type: RedisMessageType.ChannelCreate;
}

export interface ChannelUpdateRedisPayload extends IUpdateRedisPayload<Channel> {
	type: RedisMessageType.ChannelUpdate;
}

export interface ChannelDeleteRedisPayload extends IOldRedisPayload<Channel> {
	type: RedisMessageType.ChannelDelete;
}

export interface EmojiCreateRedisPayload extends IDataRedisPayload<Emoji> {
	type: RedisMessageType.EmojiCreate;
}

export interface EmojiUpdateRedisPayload extends IUpdateRedisPayload<Emoji> {
	type: RedisMessageType.EmojiUpdate;
}

export interface EmojiDeleteRedisPayload extends IOldRedisPayload<Emoji> {
	type: RedisMessageType.EmojiDelete;
}

export interface MemberCreateRedisPayload extends IDataRedisPayload<Member> {
	type: RedisMessageType.MemberCreate;
}

export interface MemberUpdateRedisPayload extends IUpdateRedisPayload<Member> {
	type: RedisMessageType.MemberUpdate;
}

export interface MemberDeleteRedisPayload extends IOldRedisPayload<Member> {
	type: RedisMessageType.MemberDelete;
}

export interface RoleCreateRedisPayload extends IDataRedisPayload<Role> {
	type: RedisMessageType.RoleCreate;
}

export interface RoleUpdateRedisPayload extends IUpdateRedisPayload<Role> {
	type: RedisMessageType.RoleUpdate;
}

export interface RoleDeleteRedisPayload extends IOldRedisPayload<Role> {
	type: RedisMessageType.RoleDelete;
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
