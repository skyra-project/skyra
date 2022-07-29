import type { APIGuildForumChannel, ChannelType } from 'discord-api-types/v10';
import type { Reader } from '../../../data/Reader';
import { GuildBasedChannel, guildBasedFromAPIShared, guildBasedFromBinaryShared } from './base/GuildBasedChannel';

export class GuildForumChannel extends GuildBasedChannel<GuildForumChannel.Type> {
	public static fromAPI(data: GuildForumChannel.Json): GuildForumChannel {
		return new GuildForumChannel(guildBasedFromAPIShared(data));
	}

	public static fromBinary(reader: Reader): GuildForumChannel {
		return new GuildForumChannel(guildBasedFromBinaryShared(reader));
	}
}

export namespace GuildForumChannel {
	export type Type = ChannelType.GuildForum;
	export type Json = Omit<APIGuildForumChannel, 'guild_id'>;
	export interface Data extends GuildBasedChannel.Data<Type> {}
}
