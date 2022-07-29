import type { Nullish } from '@sapphire/utilities';
import type { APIGuildTextChannel, GuildTextChannelType, ThreadAutoArchiveDuration } from 'discord-api-types/v10';
import { Reader } from '../../../../data/Reader';
import type { Writer } from '../../../../data/Writer';
import { GuildBasedChannel, guildBasedFromAPIShared } from './GuildBasedChannel';

export abstract class GuildTextBasedChannel<T extends GuildTextChannelType> extends GuildBasedChannel<T> {
	public readonly defaultAutoArchiveDuration: ThreadAutoArchiveDuration | null;
	public readonly topic: string | null;

	public constructor(data: GuildTextBasedChannel.Data<T>) {
		super(data);
		this.defaultAutoArchiveDuration = data.defaultAutoArchiveDuration ?? null;
		this.topic = data.topic ?? null;
	}

	public toJSON(): GuildTextBasedChannel.Json<T> {
		return {
			...super.toJSON(),
			default_auto_archive_duration: this.defaultAutoArchiveDuration ?? undefined,
			topic: this.topic
		};
	}

	protected override toBufferShared(): Writer {
		return super.toBufferShared().u32(this.defaultAutoArchiveDuration).string(this.topic);
	}
}

export namespace GuildTextBasedChannel {
	export type Json<T extends GuildTextChannelType> = Omit<APIGuildTextChannel<T>, 'guild_id' | 'last_message_id'>;

	export interface Data<T extends GuildTextChannelType> extends GuildBasedChannel.Data<T> {
		defaultAutoArchiveDuration?: ThreadAutoArchiveDuration | Nullish;
		topic?: string | Nullish;
	}

	export type DataPermissionOverwrite = GuildBasedChannel.DataPermissionOverwrite;
}

export function guildTextBasedFromAPIShared<T extends GuildTextChannelType>(data: GuildTextBasedChannel.Json<T>): GuildTextBasedChannel.Data<T> {
	return {
		...guildBasedFromAPIShared<T>(data),
		defaultAutoArchiveDuration: data.default_auto_archive_duration,
		topic: data.topic
	};
}

export function guildTextBasedFromBinaryShared<T extends GuildTextChannelType>(reader: Reader): GuildTextBasedChannel.Data<T> {
	return {
		...guildTextBasedFromBinaryShared<T>(reader),
		defaultAutoArchiveDuration: reader.u32(),
		topic: reader.string()
	};
}
