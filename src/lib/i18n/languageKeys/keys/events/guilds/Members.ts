import { FT, T } from '#lib/types';

export const GuildMemberAdd = T<string>('events/guilds/members:guildMemberAdd');
export const GuildMemberAddDescription = FT<{ mention: string; time: number }, string>('events/guilds/members:guildMemberAddDescription');
export const GuildMemberAddedRoles = FT<{ addedRoles: string; count: number }, string>('events/guilds/members:guildMemberAddedRoles');
export const GuildMemberAddMute = T<string>('events/guilds/members:guildMemberAddMute');
export const GuildMemberBanned = T<string>('events/guilds/members:guildMemberBanned');
export const GuildMemberKicked = T<string>('events/guilds/members:guildMemberKicked');
export const GuildMemberNoUpdate = T<string>('events/guilds/members:guildMemberNoUpdate');
export const GuildMemberRemove = T<string>('events/guilds/members:guildMemberRemove');
export const GuildMemberRemoveDescription = FT<{ mention: string; time: number }, string>('events/guilds/members:guildMemberRemoveDescription');
export const GuildMemberRemoveDescriptionWithJoinedAt = FT<{ mention: string; time: number }, string>(
	'events/guilds/members:guildMemberRemoveDescriptionWithJoinedAt'
);
export const GuildMemberRemovedRoles = FT<{ removedRoles: string; count: number }, string>('events/guilds/members:guildMemberRemovedRoles');
export const GuildMemberSoftBanned = T<string>('events/guilds/members:guildMemberSoftBanned');
export const NameUpdateNextWasNotSet = FT<{ nextName: string | null }, string>('events/guilds/members:nameUpdateNextWasNotSet');
export const NameUpdateNextWasSet = FT<{ nextName: string | null }, string>('events/guilds/members:nameUpdateNextWasSet');
export const NameUpdatePreviousWasNotSet = FT<{ previousName: string | null }, string>('events/guilds/members:nameUpdatePreviousWasNotSet');
export const NameUpdatePreviousWasSet = FT<{ previousName: string | null }, string>('events/guilds/members:nameUpdatePreviousWasSet');
export const NicknameUpdate = T<string>('events/guilds/members:nicknameUpdate');
export const RoleUpdate = T<string>('events/guilds/members:roleUpdate');
export const UsernameUpdate = T<string>('events/guilds/members:usernameUpdate');
