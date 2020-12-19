import { FT, T } from '#lib/types';

export const AutoRoleInvalid = T<string>('serializer:autoRoleInvalid');
export const CommandAutoDeleteInvalid = T<string>('serializer:commandAutoDeleteInvalid');
export const PermissionNodeDuplicatedCommand = FT<{ command: string }, string>('serializer:permissionNodeDuplicatedCommand');
export const PermissionNodeInvalidCommand = FT<{ command: string }, string>('serializer:permissionNodeInvalidCommand');
export const PermissionNodeInvalidTarget = T<string>('serializer:permissionNodeInvalidTarget');
export const PermissionNodeInvalid = T<string>('serializer:permissionNodeInvalid');
export const PermissionNodeSecurityEveryoneAllows = T<string>('serializer:permissionNodeSecurityEveryoneAllows');
export const PermissionNodeSecurityGuarded = FT<{ command: string }, string>('serializer:permissionNodeSecurityGuarded');
export const PermissionNodeSecurityOwner = T<string>('serializer:permissionNodeSecurityOwner');
export const ReactionRoleInvalid = T<string>('serializer:reactionRoleInvalid');
export const StickyRoleInvalid = T<string>('serializer:stickyRoleInvalid');
export const TriggerAliasInvalid = T<string>('serializer:triggerAliasInvalid');
export const TriggerIncludeInvalid = T<string>('serializer:triggerIncludeInvalid');
export const TriggerIncludeInvalidAction = T<string>('serializer:triggerIncludeInvalidAction');
export const TwitchSubscriptionInvalidStreamer = T<string>('serializer:twitchSubscriptionInvalidStreamer');
export const TwitchSubscriptionInvalid = T<string>('serializer:twitchSubscriptionInvalid');
export const UniqueRoleSetInvalid = T<string>('serializer:uniqueRoleSetInvalid');
export const Unsupported = T<string>('serializer:unsupported');

export * as CustomCommands from './CustomCommandSerializer/All';
export * as DisabledCommandChannels from './DisabledCommandChannels/All';
