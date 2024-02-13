import { FT, T } from '#lib/types';

export const GuildMemberAdd = T('events/guilds-members:guildMemberAdd');
export const GuildMemberAddDescription = FT<{ user: string; relativeTime: string }>('events/guilds-members:guildMemberAddDescription');
export const GuildMemberAddedRoles = FT<{ addedRoles: string; count: number }>('events/guilds-members:guildMemberAddedRoles');
export const GuildMemberAddMute = T('events/guilds-members:guildMemberAddMute');
export const GuildMemberBanned = T('events/guilds-members:guildMemberBanned');
export const GuildMemberKicked = T('events/guilds-members:guildMemberKicked');
export const GuildMemberNoUpdate = T('events/guilds-members:guildMemberNoUpdate');
export const GuildMemberRemove = T('events/guilds-members:guildMemberRemove');
export const GuildMemberRemoveDescription = FT<{ user: string; relativeTime: string }>('events/guilds-members:guildMemberRemoveDescription');
export const GuildMemberRemoveDescriptionWithJoinedAt = FT<{ user: string; relativeTime: string }>(
	'events/guilds-members:guildMemberRemoveDescriptionWithJoinedAt'
);
export const GuildMemberRemovedRoles = FT<{ removedRoles: string; count: number }>('events/guilds-members:guildMemberRemovedRoles');
export const GuildMemberSoftBanned = T('events/guilds-members:guildMemberSoftBanned');
export const NameUpdateNextWasNotSet = FT<{ nextName: string | null }>('events/guilds-members:nameUpdateNextWasNotSet');
export const NameUpdateNextWasSet = FT<{ nextName: string | null }>('events/guilds-members:nameUpdateNextWasSet');
export const NameUpdatePreviousWasNotSet = FT<{ previousName: string | null }>('events/guilds-members:nameUpdatePreviousWasNotSet');
export const NameUpdatePreviousWasSet = FT<{ previousName: string | null }>('events/guilds-members:nameUpdatePreviousWasSet');
export const NicknameUpdate = T('events/guilds-members:nicknameUpdate');
export const RoleUpdate = T('events/guilds-members:roleUpdate');
export const UsernameUpdate = T('events/guilds-members:usernameUpdate');
