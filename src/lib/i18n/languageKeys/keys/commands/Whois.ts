import { FT, T, type Value } from '#lib/types';

// Root
export const Name = T('commands/whois:name');
export const Description = T('commands/whois:description');
export const ContextMenuName = T('commands/whois:contextMenuName');

// Options
export const User = 'commands/whois:user';

// Embed
export const Joined = T('commands/whois:joined');
export const Created = T('commands/whois:created');
export const RolesTitle = FT<Value>('commands/whois:rolesTitle');
export const PermissionsTitle = T('commands/whois:permissionsTitle');
export const PermissionsAll = T('commands/whois:permissionsAll');
export const EmbedDescription = FT<{ createdAt: string }>('commands/whois:embedDescription');
export const EmbedMemberDescription = FT<{ joinedAt: string }>('commands/whois:embedMemberDescription');

// Buttons
export const ButtonAvatar = T('commands/whois:buttonAvatar');
export const ButtonProfile = T('commands/whois:buttonProfile');
