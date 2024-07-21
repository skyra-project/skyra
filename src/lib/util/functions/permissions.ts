import type { GuildEntity } from '#lib/database/entities';
import { GuildSettings } from '#lib/database/keys';
import { readSettings } from '#lib/database/settings';
import { OWNERS } from '#root/config';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import { GuildMember, PermissionFlagsBits } from 'discord.js';

export async function isModerator(member: GuildMember) {
	if (isGuildOwner(member)) return true;

	const settings = await readSettings(member);
	return checkModerator(member, settings) || checkAdministrator(member, settings);
}

export async function isAdmin(member: GuildMember) {
	if (isGuildOwner(member)) return true;

	const settings = await readSettings(member);
	return checkAdministrator(member, settings);
}

export function isGuildOwner(member: GuildMember) {
	return member.id === member.guild.ownerId;
}

export function isOwner(member: GuildMember) {
	return OWNERS.includes(member.id);
}

function checkModerator(member: GuildMember, settings: GuildEntity) {
	const roles = settings[GuildSettings.Roles.Moderator];
	return roles.length === 0 ? member.permissions.has(PermissionFlagsBits.BanMembers) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
}

function checkAdministrator(member: GuildMember, settings: GuildEntity) {
	const roles = settings[GuildSettings.Roles.Admin];
	return roles.length === 0 ? member.permissions.has(PermissionFlagsBits.ManageGuild) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
}
