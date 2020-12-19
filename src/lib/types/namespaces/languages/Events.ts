import { FT, T } from '#lib/types';

export const GuildMemberAdd = T<string>('events:guildMemberAdd');
export const GuildMemberAddMute = T<string>('events:guildMemberAddMute');
export const GuildMemberAddDescription = FT<{ mention: string; time: number }, string>('events:guildMemberAddDescription');
export const GuildMemberRemove = T<string>('events:guildMemberRemove');
export const GuildMemberKicked = T<string>('events:guildMemberKicked');
export const GuildMemberBanned = T<string>('events:guildMemberBanned');
export const GuildMemberSoftBanned = T<string>('events:guildMemberSoftBanned');
export const GuildMemberRemoveDescription = FT<{ mention: string; time: number }, string>('events:guildMemberRemoveDescription');
export const GuildMemberRemoveDescriptionWithJoinedAt = FT<{ mention: string; time: number }, string>(
	'events:guildMemberRemoveDescriptionWithJoinedAt'
);
export const GuildMemberUpdateNickname = FT<{ previous: string; current: string }, string>('events:guildMemberUpdateNickname');
export const GuildMemberAddedNickname = FT<{ previous: string; current: string }, string>('events:guildMemberAddedNickname');
export const GuildMemberRemovedNickname = FT<{ previous: string }, string>('events:guildMemberRemovedNickname');
export const NicknameUpdate = T<string>('events:nicknameUpdate');
export const UsernameUpdate = T<string>('events:usernameUpdate');
export const NameUpdatePreviousWasSet = FT<{ previousName: string | null }, string>('events:nameUpdatePreviousWasSet');
export const NameUpdatePreviousWasNotSet = FT<{ previousName: string | null }, string>('events:nameUpdatePreviousWasNotSet');
export const NameUpdateNextWasSet = FT<{ nextName: string | null }, string>('events:nameUpdateNextWasSet');
export const NameUpdateNextWasNotSet = FT<{ nextName: string | null }, string>('events:nameUpdateNextWasNotSet');
export const GuildMemberNoUpdate = T<string>('events:guildMemberNoUpdate');
export const GuildMemberAddedRoles = FT<{ addedRoles: string }, string>('events:guildMemberAddedRoles');
export const GuildMemberAddedRolesPlural = FT<{ addedRoles: string }, string>('events:guildMemberAddedRolesPlural');
export const GuildMemberRemovedRoles = FT<{ removedRoles: string }, string>('events:guildMemberRemovedRoles');
export const GuildMemberRemovedRolesPlural = FT<{ removedRoles: string }, string>('events:guildMemberRemovedRolesPlural');
export const RoleUpdate = T<string>('events:roleUpdate');
export const MessageUpdate = T<string>('events:messageUpdate');
export const MessageDelete = T<string>('events:messageDelete');
export const Reaction = T<string>('events:reaction');
export const Command = FT<{ command: string }, string>('events:command');
export const ErrorWtf = T<string>('events:errorWtf');
export const ErrorString = FT<{ mention: string; message: string }, string>('events:errorString');
