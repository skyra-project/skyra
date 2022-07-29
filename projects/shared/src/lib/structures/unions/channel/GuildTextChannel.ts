import type { Nullish } from '@sapphire/utilities';
import type { APITextChannel, ChannelType } from 'discord-api-types/v10';
import type { Reader } from '../../../data/Reader';
import { GuildTextBasedChannel, guildTextBasedFromAPIShared, guildTextBasedFromBinaryShared } from './base/GuildTextBasedChannel';

export class GuildTextChannel extends GuildTextBasedChannel<GuildTextChannel.Type> {
	public readonly rateLimitPerUser: number | null;

	public constructor(data: GuildTextChannel.Data) {
		super(data);
		this.rateLimitPerUser = data.rateLimitPerUser ?? null;
	}

	public toBuffer(): Buffer {
		return this.toBufferShared().u16(this.rateLimitPerUser).trimmed;
	}

	public toJSON(): GuildTextChannel.Json {
		return {
			...super.toJSON(),
			rate_limit_per_user: this.rateLimitPerUser ?? undefined
		};
	}

	public static fromAPI(data: GuildTextChannel.Json): GuildTextChannel {
		return new GuildTextChannel({
			...guildTextBasedFromAPIShared(data),
			rateLimitPerUser: data.rate_limit_per_user
		});
	}

	public static fromBinary(reader: Reader): GuildTextChannel {
		return new GuildTextChannel({
			...guildTextBasedFromBinaryShared(reader),
			rateLimitPerUser: reader.u16()
		});
	}
}

export namespace GuildTextChannel {
	export type Type = ChannelType.GuildText;
	export type Json = Omit<APITextChannel, 'guild_id' | 'last_message_id'>;
	export interface Data extends GuildTextBasedChannel.Data<Type> {
		rateLimitPerUser?: number | Nullish;
	}
}
