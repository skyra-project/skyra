import { FT, T } from '@lib/types/Shared';

export const GuildMemberAdd = T<string>('eventsGuildMemberAdd');
export const GuildMemberAddMute = T<string>('eventsGuildMemberAddMute');
export const GuildMemberAddRaid = T<string>('eventsGuildMemberAddRaid');
export const GuildMemberAddDescription = FT<{ mention: string; time: number }, string>('eventsGuildMemberAddDescription');
export const GuildMemberRemove = T<string>('eventsGuildMemberRemove');
export const GuildMemberKicked = T<string>('eventsGuildMemberKicked');
export const GuildMemberBanned = T<string>('eventsGuildMemberBanned');
export const GuildMemberSoftBanned = T<string>('eventsGuildMemberSoftBanned');
export const GuildMemberRemoveDescription = FT<{ mention: string; time: number }, string>('eventsGuildMemberRemoveDescription');
export const GuildMemberRemoveDescriptionWithJoinedAt = FT<{ mention: string; time: number }, string>(
	'eventsGuildMemberRemoveDescriptionWithJoinedAt'
);
export const GuildMemberUpdateNickname = FT<{ previous: string; current: string }, string>('eventsGuildMemberUpdateNickname');
export const GuildMemberAddedNickname = FT<{ previous: string; current: string }, string>('eventsGuildMemberAddedNickname');
export const GuildMemberRemovedNickname = FT<{ previous: string }, string>('eventsGuildMemberRemovedNickname');
export const NicknameUpdate = T<string>('eventsNicknameUpdate');
export const UsernameUpdate = T<string>('eventsUsernameUpdate');
export const NameUpdatePreviousWasSet = FT<{ previousName: string | null }, string>('eventsNameUpdatePreviousWasSet');
export const NameUpdatePreviousWasNotSet = FT<{ previousName: string | null }, string>('eventsNameUpdatePreviousWasNotSet');
export const NameUpdateNextWasSet = FT<{ nextName: string | null }, string>('eventsNameUpdateNextWasSet');
export const NameUpdateNextWasNotSet = FT<{ nextName: string | null }, string>('eventsNameUpdateNextWasNotSet');
export const GuildMemberNoUpdate = T<string>('eventsGuildMemberNoUpdate');
export const GuildMemberAddedRoles = FT<{ addedRoles: string }, string>('eventsGuildMemberAddedRoles');
export const GuildMemberAddedRolesPlural = FT<{ addedRoles: string }, string>('eventsGuildMemberAddedRolesPlural');
export const GuildMemberRemovedRoles = FT<{ removedRoles: string }, string>('eventsGuildMemberRemovedRoles');
export const GuildMemberRemovedRolesPlural = FT<{ removedRoles: string }, string>('eventsGuildMemberRemovedRolesPlural');
export const RoleUpdate = T<string>('eventsRoleUpdate');
export const MessageUpdate = T<string>('eventsMessageUpdate');
export const MessageDelete = T<string>('eventsMessageDelete');
export const Reaction = T<string>('eventsReaction');
export const Command = FT<{ command: string }, string>('eventsCommand');
export const ErrorWtf = T<string>('eventsErrorWtf');
export const ErrorString = FT<{ mention: string; message: string }, string>('eventsErrorString');
