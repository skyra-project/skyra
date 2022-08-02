import type { APINewsChannel, ChannelType } from 'discord-api-types/v10';
import type { Reader } from '../../../../data/Reader.js';
import { GuildTextBasedChannel, guildTextBasedFromAPIShared, guildTextBasedFromBinaryShared } from './base/GuildTextBasedChannel.js';

export class GuildNewsChannel extends GuildTextBasedChannel<GuildNewsChannel.Type> {
	public static fromAPI(data: GuildNewsChannel.Json): GuildNewsChannel {
		return new GuildNewsChannel(guildTextBasedFromAPIShared(data));
	}

	public static fromBinary(reader: Reader): GuildNewsChannel {
		return new GuildNewsChannel(guildTextBasedFromBinaryShared(reader));
	}
}

export namespace GuildNewsChannel {
	export type Type = ChannelType.GuildNews;
	export type Json = Omit<APINewsChannel, 'guild_id' | 'last_message_id'>;
	export interface Data extends GuildTextBasedChannel.Data<Type> {}
}
