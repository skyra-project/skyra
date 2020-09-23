import { T } from '@lib/types/Shared';

export const eventsGuildMemberAdd = T<string>('eventsGuildMemberAdd');
export const eventsGuildMemberAddMute = T<string>('eventsGuildMemberAddMute');
export const eventsGuildMemberAddRaid = T<string>('eventsGuildMemberAddRaid');
export const eventsGuildMemberAddDescription = T<(params: { mention: string; time: number }) => string>('eventsGuildMemberAddDescription');
export const eventsGuildMemberRemove = T<string>('eventsGuildMemberRemove');
export const eventsGuildMemberKicked = T<string>('eventsGuildMemberKicked');
export const eventsGuildMemberBanned = T<string>('eventsGuildMemberBanned');
export const eventsGuildMemberSoftBanned = T<string>('eventsGuildMemberSoftBanned');
export const eventsGuildMemberRemoveDescription = T<(params: { mention: string; time: number }) => string>('eventsGuildMemberRemoveDescription');
export const eventsGuildMemberRemoveDescriptionWithJoinedAt = T<(params: { mention: string; time: number }) => string>(
	'eventsGuildMemberRemoveDescriptionWithJoinedAt'
);
export const eventsGuildMemberUpdateNickname = T<(params: { previous: string; current: string }) => string>('eventsGuildMemberUpdateNickname');
export const eventsGuildMemberAddedNickname = T<(params: { previous: string; current: string }) => string>('eventsGuildMemberAddedNickname');
export const eventsGuildMemberRemovedNickname = T<(params: { previous: string }) => string>('eventsGuildMemberRemovedNickname');
export const eventsNicknameUpdate = T<string>('eventsNicknameUpdate');
export const eventsUsernameUpdate = T<string>('eventsUsernameUpdate');
export const eventsNameUpdatePreviousWasSet = T<(params: { previousName: string | null }) => string>('eventsNameUpdatePreviousWasSet');
export const eventsNameUpdatePreviousWasNotSet = T<(params: { previousName: string | null }) => string>('eventsNameUpdatePreviousWasNotSet');
export const eventsNameUpdateNextWasSet = T<(params: { nextName: string | null }) => string>('eventsNameUpdateNextWasSet');
export const eventsNameUpdateNextWasNotSet = T<(params: { nextName: string | null }) => string>('eventsNameUpdateNextWasNotSet');
export const eventsGuildMemberNoUpdate = T<string>('eventsGuildMemberNoUpdate');
export const eventsGuildMemberAddedRoles = T<(params: { addedRoles: string }) => string>('eventsGuildMemberAddedRoles');
export const eventsGuildMemberAddedRolesPlural = T<(params: { addedRoles: string }) => string>('eventsGuildMemberAddedRolesPlural');
export const eventsGuildMemberRemovedRoles = T<(params: { removedRoles: string }) => string>('eventsGuildMemberRemovedRoles');
export const eventsGuildMemberRemovedRolesPlural = T<(params: { removedRoles: string }) => string>('eventsGuildMemberRemovedRolesPlural');
export const eventsRoleUpdate = T<string>('eventsRoleUpdate');
export const eventsMessageUpdate = T<string>('eventsMessageUpdate');
export const eventsMessageDelete = T<string>('eventsMessageDelete');
export const eventsReaction = T<string>('eventsReaction');
export const eventsCommand = T<(params: { command: string }) => string>('eventsCommand');
export const eventsErrorWtf = T<string>('eventsErrorWtf');
export const eventsErrorString = T<(params: { mention: string; message: string }) => string>('eventsErrorString');
