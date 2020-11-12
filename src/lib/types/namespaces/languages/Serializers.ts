import { FT, T } from '@lib/types';

export const AutoRoleInvalid = T<string>('serializerAutoRoleInvalid');
export const CommandAutoDeleteInvalid = T<string>('serializerCommandAutoDeleteInvalid');
export const PermissionNodeDuplicatedCommand = FT<{ command: string }, string>('serializerPermissionNodeDuplicatedCommand');
export const PermissionNodeInvalidCommand = FT<{ command: string }, string>('serializerPermissionNodeInvalidCommand');
export const PermissionNodeInvalidTarget = T<string>('serializerPermissionNodeInvalidTarget');
export const PermissionNodeInvalid = T<string>('serializerPermissionNodeInvalid');
export const PermissionNodeSecurityEveryoneAllows = T<string>('serializerPermissionNodeSecurityEveryoneAllows');
export const PermissionNodeSecurityGuarded = FT<{ command: string }, string>('serializerPermissionNodeSecurityGuarded');
export const PermissionNodeSecurityOwner = T<string>('serializerPermissionNodeSecurityOwner');
export const ReactionRoleInvalid = T<string>('serializerReactionRoleInvalid');
export const StickyRoleInvalid = T<string>('serializerStickyRoleInvalid');
export const TriggerAliasInvalid = T<string>('serializerTriggerAliasInvalid');
export const TriggerIncludeInvalid = T<string>('serializerTriggerIncludeInvalid');
export const TriggerIncludeInvalidAction = T<string>('serializerTriggerIncludeInvalidAction');
export const TwitchSubscriptionInvalidStreamer = T<string>('serializerTwitchSubscriptionInvalidStreamer');
export const TwitchSubscriptionInvalid = T<string>('serializerTwitchSubscriptionInvalid');
export const UniqueRoleSetInvalid = T<string>('serializerUniqueRoleSetInvalid');
export const Unsupported = T<string>('serializerUnsupported');

export * as CustomCommands from './CustomCommandSerializer/All';
export * as DisabledCommandChannels from './DisabledCommandChannels/All';
