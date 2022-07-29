import {
	ChannelType,
	type APIChannel,
	type APIGuildCategoryChannel,
	type APIGuildChannel,
	type APIGuildForumChannel,
	type APIGuildTextChannel,
	type APINewsChannel,
	type APITextChannel,
	type APIVoiceChannel,
	type GuildTextChannelType
} from 'discord-api-types/v10';
import { Writer } from './common/Writer';

export function serializeChannel(data: APIChannel) {
	switch (data.type) {
		case ChannelType.GuildText:
			return serializeGuildTextChannel(data);
		case ChannelType.GuildVoice:
		case ChannelType.GuildStageVoice:
			return serializeGuildVoiceChannel(data);
		case ChannelType.GuildCategory:
			return serializeGuildCategoryChannel(data);
		case ChannelType.GuildNews:
			return serializeGuildNewsChannel(data);
		case ChannelType.GuildForum:
			return serializeGuildForumChannel(data);
		case ChannelType.DM:
		case ChannelType.GroupDM:
		case ChannelType.GuildNewsThread:
		case ChannelType.GuildPublicThread:
		case ChannelType.GuildPrivateThread:
			return null;
		default:
			console.warn(`Unknown type: ${(data as APIChannel).type}`, data);
			return null;
	}
}

function serializeGuildBasedChannel<T extends ChannelType>(data: APIGuildChannel<T>) {
	return new Writer(100)
		.u64(data.id)
		.string(data.name)
		.u8(data.type)
		.bool(data.nsfw)
		.u64(data.parent_id)
		.array(data.permission_overwrites, (buffer, value) => buffer.u64(value.id).u8(value.type).u64(value.allow).u64(value.deny))
		.u16(data.position);
}

function serializeGuildTextBasedChannel<T extends GuildTextChannelType>(data: APIGuildTextChannel<T>) {
	return serializeGuildBasedChannel(data).u32(data.default_auto_archive_duration).string(data.topic);
}

function serializeGuildTextChannel(data: APITextChannel) {
	return serializeGuildTextBasedChannel(data).u16(data.rate_limit_per_user).trimmed;
}

function serializeGuildNewsChannel(data: APINewsChannel) {
	return serializeGuildTextBasedChannel(data).trimmed;
}

function serializeGuildVoiceChannel(data: APIVoiceChannel) {
	return serializeGuildBasedChannel(data).u32(data.bitrate).u32(data.user_limit).string(data.rtc_region).u8(data.video_quality_mode).trimmed;
}

function serializeGuildCategoryChannel(data: APIGuildCategoryChannel) {
	return serializeGuildBasedChannel(data).trimmed;
}

function serializeGuildForumChannel(data: APIGuildForumChannel) {
	return serializeGuildBasedChannel(data).trimmed;
}
