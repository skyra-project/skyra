import type { Nullish } from '@sapphire/utilities';
import type { APIVoiceChannel, ChannelType, VideoQualityMode } from 'discord-api-types/v10';
import type { Reader } from '../../../data/Reader';
import { GuildBasedChannel, guildBasedFromAPIShared, guildBasedFromBinaryShared } from './base/GuildBasedChannel';

export class GuildVoiceChannel extends GuildBasedChannel<GuildVoiceChannel.Type> {
	public readonly bitrate: number | null;
	public readonly userLimit: number | null;
	public readonly rtcRegion: string | null;
	public readonly videoQualityMode: VideoQualityMode | null;

	public constructor(data: GuildVoiceChannel.Data) {
		super(data);
		this.bitrate = data.bitrate ?? null;
		this.userLimit = data.userLimit ?? null;
		this.rtcRegion = data.rtcRegion ?? null;
		this.videoQualityMode = data.videoQualityMode ?? null;
	}

	public toBuffer(): Buffer {
		return this.toBufferShared().u32(this.bitrate).u32(this.userLimit).string(this.rtcRegion).u8(this.videoQualityMode).trimmed;
	}

	public toJSON(): GuildVoiceChannel.Json {
		return {
			...super.toJSON(),
			bitrate: this.bitrate ?? undefined,
			user_limit: this.userLimit ?? undefined,
			rtc_region: this.rtcRegion,
			video_quality_mode: this.videoQualityMode ?? undefined
		};
	}

	public static fromAPI(data: GuildVoiceChannel.Json): GuildVoiceChannel {
		return new GuildVoiceChannel({
			...guildBasedFromAPIShared(data),
			bitrate: data.bitrate,
			userLimit: data.user_limit,
			rtcRegion: data.rtc_region,
			videoQualityMode: data.video_quality_mode
		});
	}

	public static fromBinary(reader: Reader): GuildVoiceChannel {
		return new GuildVoiceChannel({
			...guildBasedFromBinaryShared(reader),
			bitrate: reader.u32(),
			userLimit: reader.u32(),
			rtcRegion: reader.string(),
			videoQualityMode: reader.u8()
		});
	}
}

export namespace GuildVoiceChannel {
	export type Type = ChannelType.GuildStageVoice | ChannelType.GuildVoice;
	export type Json = Omit<APIVoiceChannel, 'guild_id'>;
	export interface Data extends GuildBasedChannel.Data<Type> {
		bitrate?: number | Nullish;
		userLimit?: number | Nullish;
		rtcRegion?: string | Nullish;
		videoQualityMode?: VideoQualityMode | Nullish;
	}
}
