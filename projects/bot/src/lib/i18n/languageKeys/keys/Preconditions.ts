import { FT, T } from '#lib/types';

// Sapphire built-in:
export const ClientPermissions = FT<{ missing: string[] }>('preconditions:clientPermissions');
export const Cooldown = FT<{ remaining: number }>('preconditions:cooldown');
export const DisabledGlobal = T('preconditions:disabledGlobal');
export const DmOnly = T('preconditions:dmOnly');
export const GuildNewsOnly = T('preconditions:guildNewsOnly');
export const GuildNewsThreadOnly = T('preconditions:guildNewsThreadOnly');
export const GuildOnly = T('preconditions:guildOnly');
export const GuildPrivateThreadOnly = T('preconditions:guildPrivateThreadOnly');
export const GuildPublicThreadOnly = T('preconditions:guildPublicThreadOnly');
export const GuildTextOnly = T('preconditions:guildTextOnly');
export const Nsfw = T('preconditions:nsfw');
export const ThreadOnly = T('preconditions:threadOnly');
export const UserPermissions = FT<{ missing: string[] }>('preconditions:userPermissions');

// Skyra:
export const Administrator = T('preconditions:administrator');
export const Moderator = T('preconditions:moderator');
export const NewsOnly = T('preconditions:newsOnly');
export const PermissionNodes = T('preconditions:permissionNodes');
export const ServerOwner = T('preconditions:serverOwner');
export const SubCommandGuildOnly = T('preconditions:subCommandGuildOnly');
export const TextOnly = T('preconditions:textOnly');
