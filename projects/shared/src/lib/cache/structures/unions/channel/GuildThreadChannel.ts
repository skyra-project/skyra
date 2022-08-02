import type { Nullish } from '@sapphire/utilities';
import type { APIThreadChannel, ChannelType, ThreadAutoArchiveDuration } from 'discord-api-types/v10';
import { fromTimestamp, normalizeNullable, toTimestamp } from '../../../../common/util.js';
import type { Reader } from '../../../../data/Reader.js';
import { GuildBasedChannel, guildBasedFromAPIShared, guildBasedFromBinaryShared } from './base/GuildBasedChannel.js';

export class GuildThreadChannel extends GuildBasedChannel<GuildThreadChannel.Type> {
	public readonly ownerId: bigint | null;
	public readonly rateLimitPerUser: number | null;
	public readonly archived: boolean;
	public readonly autoArchiveDuration: ThreadAutoArchiveDuration;
	public readonly archiveAt: number;
	public readonly locked: boolean | null;
	public readonly invitable: boolean | null;
	public readonly createdAt: number | null;

	public constructor(data: GuildThreadChannel.Data) {
		super(data);
		this.ownerId = data.ownerId ?? null;
		this.rateLimitPerUser = data.rateLimitPerUser ?? null;
		this.archived = data.archived;
		this.autoArchiveDuration = data.autoArchiveDuration;
		this.archiveAt = data.archiveAt;
		this.locked = data.locked ?? null;
		this.invitable = data.invitable ?? null;
		this.createdAt = data.createdAt ?? null;
	}

	public override toBuffer(): Buffer {
		return this.toBufferShared()
			.u64(this.ownerId)
			.u16(this.rateLimitPerUser)
			.bool(this.archived)
			.u16(this.autoArchiveDuration)
			.date(this.archiveAt)
			.bool(this.locked)
			.bool(this.invitable)
			.date(this.createdAt).trimmed;
	}

	public override toJSON(): GuildThreadChannel.Json {
		return {
			...super.toJSON(),
			owner_id: this.ownerId?.toString(),
			rate_limit_per_user: this.rateLimitPerUser ?? undefined,
			thread_metadata: {
				archived: this.archived,
				auto_archive_duration: this.autoArchiveDuration,
				archive_timestamp: fromTimestamp(this.archiveAt),
				locked: this.locked ?? undefined,
				invitable: this.invitable ?? undefined,
				create_timestamp: fromTimestamp(this.createdAt) ?? undefined
			}
		};
	}

	public static fromAPI(data: GuildThreadChannel.Json): GuildThreadChannel {
		return new GuildThreadChannel({
			...guildBasedFromAPIShared(data),
			ownerId: normalizeNullable(data.owner_id, BigInt),
			rateLimitPerUser: data.rate_limit_per_user,
			archived: data.thread_metadata!.archived,
			autoArchiveDuration: data.thread_metadata!.auto_archive_duration,
			archiveAt: toTimestamp(data.thread_metadata!.archive_timestamp),
			locked: data.thread_metadata!.locked,
			invitable: data.thread_metadata!.invitable,
			createdAt: toTimestamp(data.thread_metadata!.create_timestamp)
		});
	}

	public static fromBinary(reader: Reader): GuildThreadChannel {
		return new GuildThreadChannel({
			...guildBasedFromBinaryShared(reader),
			ownerId: reader.u64(),
			rateLimitPerUser: reader.u16(),
			archived: reader.bool()!,
			autoArchiveDuration: reader.u16()!,
			archiveAt: reader.date()!,
			locked: reader.bool(),
			invitable: reader.bool(),
			createdAt: reader.date()
		});
	}
}

export namespace GuildThreadChannel {
	export type Type = ChannelType.GuildPublicThread | ChannelType.GuildPrivateThread | ChannelType.GuildNewsThread;
	export type Json = Omit<APIThreadChannel, 'guild_id' | 'member' | 'message_count' | 'member_count' | 'last_message_id' | 'total_message_sent'>;
	export interface Data extends GuildBasedChannel.Data<Type> {
		ownerId?: bigint | Nullish;
		rateLimitPerUser?: number | Nullish;
		archived: boolean;
		autoArchiveDuration: ThreadAutoArchiveDuration;
		archiveAt: number;
		locked?: boolean | Nullish;
		invitable?: boolean | Nullish;
		createdAt?: number | Nullish;
	}
}
