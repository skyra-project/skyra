import { T } from '#lib/types';

export const ChannelCreate = T<string>('settings:channelsLogsChannelCreate');
export const ChannelDelete = T<string>('settings:channelsLogsChannelDelete');
export const ChannelUpdate = T<string>('settings:channelsLogsChannelUpdate');
export const EmojiCreate = T<string>('settings:channelsLogsEmojiCreate');
export const EmojiDelete = T<string>('settings:channelsLogsEmojiDelete');
export const EmojiUpdate = T<string>('settings:channelsLogsEmojiUpdate');
export const Image = T<string>('settings:channelsLogsImage');
export const Member = T<string>('settings:channelsLogsMember');
export const Message = T<string>('settings:channelsLogsMessage');
export const Moderation = T<string>('settings:channelsLogsModeration');
export const NsfwMessage = T<string>('settings:channelsLogsNsfwMessage');
export const Prune = T<string>('settings:channelsLogsPrune');
export const Reaction = T<string>('settings:channelsLogsReaction');
export const RoleCreate = T<string>('settings:channelsLogsRoleCreate');
export const RoleDelete = T<string>('settings:channelsLogsRoleDelete');
export const RoleUpdate = T<string>('settings:channelsLogsRoleUpdate');
export const ServerUpdate = T<string>('settings:channelsLogsServerUpdate');
