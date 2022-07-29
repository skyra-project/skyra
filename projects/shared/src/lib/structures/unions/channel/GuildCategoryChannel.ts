import type { APIGuildCategoryChannel, ChannelType } from 'discord-api-types/v10';
import type { Reader } from '../../../data/Reader';
import { GuildBasedChannel, guildBasedFromAPIShared, guildBasedFromBinaryShared } from './base/GuildBasedChannel';

export class GuildCategoryChannel extends GuildBasedChannel<GuildCategoryChannel.Type> {
	public static fromAPI(data: GuildCategoryChannel.Json): GuildCategoryChannel {
		return new GuildCategoryChannel(guildBasedFromAPIShared(data));
	}

	public static fromBinary(reader: Reader): GuildCategoryChannel {
		return new GuildCategoryChannel(guildBasedFromBinaryShared(reader));
	}
}

export namespace GuildCategoryChannel {
	export type Type = ChannelType.GuildCategory;
	export type Json = Omit<APIGuildCategoryChannel, 'guild_id'>;
	export interface Data extends GuildBasedChannel.Data<Type> {}
}
