import { FT, T } from '#lib/types';

export const AutoRoleInvalid = T<string>('serializers:autoRoleInvalid');
export const CommandAutoDeleteInvalid = T<string>('serializers:commandAutoDeleteInvalid');
export const PermissionNodeDuplicatedCommand = FT<{ command: string }, string>('serializers:permissionNodeDuplicatedCommand');
export const PermissionNodeInvalidCommand = FT<{ command: string }, string>('serializers:permissionNodeInvalidCommand');
export const PermissionNodeInvalidTarget = T<string>('serializers:permissionNodeInvalidTarget');
export const PermissionNodeInvalid = T<string>('serializers:permissionNodeInvalid');
export const PermissionNodeSecurityEveryoneAllows = T<string>('serializers:permissionNodeSecurityEveryoneAllows');
export const PermissionNodeSecurityGuarded = FT<{ command: string }, string>('serializers:permissionNodeSecurityGuarded');
export const PermissionNodeSecurityOwner = T<string>('serializers:permissionNodeSecurityOwner');
export const ReactionRoleInvalid = T<string>('serializers:reactionRoleInvalid');
export const StickyRoleInvalid = T<string>('serializers:stickyRoleInvalid');
export const TriggerAliasInvalid = T<string>('serializers:triggerAliasInvalid');
export const TriggerIncludeInvalid = T<string>('serializers:triggerIncludeInvalid');
export const TriggerIncludeInvalidAction = T<string>('serializers:triggerIncludeInvalidAction');
export const TwitchSubscriptionInvalidStreamer = T<string>('serializers:twitchSubscriptionInvalidStreamer');
export const TwitchSubscriptionInvalid = T<string>('serializers:twitchSubscriptionInvalid');
export const UniqueRoleSetInvalid = T<string>('serializers:uniqueRoleSetInvalid');
export const Unsupported = T<string>('serializers:unsupported');

export * as CustomCommands from './CustomCommandSerializer/All';
export * as DisabledCommandChannels from './DisabledCommandChannels/All';
