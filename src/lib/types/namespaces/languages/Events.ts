import { FT, T } from '@lib/types/Shared';

export const eventsGuildMemberAdd = T<string>('eventsGuildMemberAdd');
export const eventsGuildMemberAddMute = T<string>('eventsGuildMemberAddMute');
export const eventsGuildMemberAddRaid = T<string>('eventsGuildMemberAddRaid');
export const eventsGuildMemberAddDescription = FT<{ mention: string; time: number }, string>('eventsGuildMemberAddDescription');
export const eventsGuildMemberRemove = T<string>('eventsGuildMemberRemove');
export const eventsGuildMemberKicked = T<string>('eventsGuildMemberKicked');
export const eventsGuildMemberBanned = T<string>('eventsGuildMemberBanned');
export const eventsGuildMemberSoftBanned = T<string>('eventsGuildMemberSoftBanned');
export const eventsGuildMemberRemoveDescription = FT<{ mention: string; time: number }, string>('eventsGuildMemberRemoveDescription');
export const eventsGuildMemberRemoveDescriptionWithJoinedAt = FT<{ mention: string; time: number }, string>(
	'eventsGuildMemberRemoveDescriptionWithJoinedAt'
);
export const eventsGuildMemberUpdateNickname = FT<{ previous: string; current: string }, string>('eventsGuildMemberUpdateNickname');
export const eventsGuildMemberAddedNickname = FT<{ previous: string; current: string }, string>('eventsGuildMemberAddedNickname');
export const eventsGuildMemberRemovedNickname = FT<{ previous: string }, string>('eventsGuildMemberRemovedNickname');
export const eventsNicknameUpdate = T<string>('eventsNicknameUpdate');
export const eventsUsernameUpdate = T<string>('eventsUsernameUpdate');
export const eventsNameUpdatePreviousWasSet = FT<{ previousName: string | null }, string>('eventsNameUpdatePreviousWasSet');
export const eventsNameUpdatePreviousWasNotSet = FT<{ previousName: string | null }, string>('eventsNameUpdatePreviousWasNotSet');
export const eventsNameUpdateNextWasSet = FT<{ nextName: string | null }, string>('eventsNameUpdateNextWasSet');
export const eventsNameUpdateNextWasNotSet = FT<{ nextName: string | null }, string>('eventsNameUpdateNextWasNotSet');
export const eventsGuildMemberNoUpdate = T<string>('eventsGuildMemberNoUpdate');
export const eventsGuildMemberAddedRoles = FT<{ addedRoles: string }, string>('eventsGuildMemberAddedRoles');
export const eventsGuildMemberAddedRolesPlural = FT<{ addedRoles: string }, string>('eventsGuildMemberAddedRolesPlural');
export const eventsGuildMemberRemovedRoles = FT<{ removedRoles: string }, string>('eventsGuildMemberRemovedRoles');
export const eventsGuildMemberRemovedRolesPlural = FT<{ removedRoles: string }, string>('eventsGuildMemberRemovedRolesPlural');
export const eventsRoleUpdate = T<string>('eventsRoleUpdate');
export const eventsMessageUpdate = T<string>('eventsMessageUpdate');
export const eventsMessageDelete = T<string>('eventsMessageDelete');
export const eventsReaction = T<string>('eventsReaction');
export const eventsCommand = FT<{ command: string }, string>('eventsCommand');
export const eventsErrorWtf = T<string>('eventsErrorWtf');
export const eventsErrorString = FT<{ mention: string; message: string }, string>('eventsErrorString');
