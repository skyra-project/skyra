import { ChannelType, type APIChannel } from 'discord-api-types/v10';
import type { Reader } from '../data/Reader';
import { GuildCategoryChannel } from './unions/channel/GuildCategoryChannel';
import { GuildForumChannel } from './unions/channel/GuildForumChannel';
import { GuildNewsChannel } from './unions/channel/GuildNewsChannel';
import { GuildTextChannel } from './unions/channel/GuildTextChannel';
import { GuildThreadChannel } from './unions/channel/GuildThreadChannel';
import { GuildVoiceChannel } from './unions/channel/GuildVoiceChannel';

export type Channel =
	| GuildCategoryChannel //
	| GuildForumChannel
	| GuildNewsChannel
	| GuildTextChannel
	| GuildThreadChannel
	| GuildVoiceChannel;

export namespace Channel {
	export function fromAPI(data: APIChannel): Channel {
		const { type } = data;
		switch (type) {
			case ChannelType.GuildText:
				return GuildTextChannel.fromAPI(data);
			case ChannelType.GuildStageVoice:
			case ChannelType.GuildVoice:
				return GuildVoiceChannel.fromAPI(data);
			case ChannelType.GuildCategory:
				return GuildCategoryChannel.fromAPI(data);
			case ChannelType.GuildNews:
				return GuildNewsChannel.fromAPI(data);
			case ChannelType.GuildForum:
				return GuildForumChannel.fromAPI(data);
			case ChannelType.GuildPublicThread:
			case ChannelType.GuildPrivateThread:
			case ChannelType.GuildNewsThread:
				return GuildThreadChannel.fromAPI(data);
			default:
				throw new RangeError(`Unsupported channel type: ${type}`);
		}
	}

	export function fromBinary(reader: Reader): Channel {
		// Channel data is encoded in the following way:
		//
		// | 0    | 1...8    | 9    | 10        | ...
		// | Null | ID (u64) | Null | Type (u8) | ...
		//
		// So in order to read which type the channel is, we read the 10th bit,
		// which will contain the value for `channel.type`:
		const type = reader.data.readUInt8(10) as ChannelType;
		switch (type) {
			case ChannelType.GuildText:
				return GuildTextChannel.fromBinary(reader);
			case ChannelType.GuildStageVoice:
			case ChannelType.GuildVoice:
				return GuildVoiceChannel.fromBinary(reader);
			case ChannelType.GuildCategory:
				return GuildCategoryChannel.fromBinary(reader);
			case ChannelType.GuildNews:
				return GuildNewsChannel.fromBinary(reader);
			case ChannelType.GuildForum:
				return GuildForumChannel.fromBinary(reader);
			case ChannelType.GuildPublicThread:
			case ChannelType.GuildPrivateThread:
			case ChannelType.GuildNewsThread:
				return GuildThreadChannel.fromBinary(reader);
			default:
				throw new RangeError(`Unsupported channel type: ${type}`);
		}
	}
}
