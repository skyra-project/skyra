import type { GuildEntity } from '#lib/database/entities';
import { GuildSettings } from '#lib/database/keys';
import { readSettings } from '#lib/database/settings';
import { OWNERS } from '#root/config';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import { GuildMember, Permissions, VoiceChannel } from 'discord.js';
import { getListeners } from './channels';

export function isDJ(member: GuildMember) {
	return (
		isGuildOwner(member) ||
		isOnlyListener(member) ||
		readSettings(member, (settings) => checkDj(member, settings) || checkModerator(member, settings) || checkAdministrator(member, settings))
	);
}

export function isModerator(member: GuildMember) {
	return isGuildOwner(member) || readSettings(member, (settings) => checkModerator(member, settings) || checkAdministrator(member, settings));
}

export function isAdmin(member: GuildMember) {
	return isGuildOwner(member) || readSettings(member, (settings) => checkAdministrator(member, settings));
}

export function isGuildOwner(member: GuildMember) {
	return member.id === member.guild.ownerID;
}

export function isOnlyListener(member: GuildMember) {
	const { voiceChannel } = member.guild.audio;
	if (voiceChannel === null) return false;

	const listeners = getListeners(voiceChannel);
	return listeners.length === 1 && listeners[0] === member.id;
}

export function isOwner(member: GuildMember) {
	return OWNERS.includes(member.id);
}

export async function canManage(member: GuildMember, voiceChannel: VoiceChannel) {
	const listeners = getListeners(voiceChannel);
	const { id } = member;

	// If the member is the only listener, they receive full permissions on them.
	if (listeners.length === 1 && listeners[0] === id) return true;

	// If the member is a DJ, queues are always manageable for them.
	if (await isDJ(member)) return true;

	const [current, tracks] = await Promise.all([member.guild.audio.getCurrentTrack(), member.guild.audio.tracks()]);

	// If the current song and all queued songs are requested by the author, the queue is still manageable.
	if ((current ? current.author === id : true) && tracks.every((track) => track.author === id)) return true;

	// Else if the author is a moderator+, queues are always manageable for them.
	return false;
}

function checkDj(member: GuildMember, settings: GuildEntity) {
	const roles = settings[GuildSettings.Roles.Dj];
	return roles.length === 0 ? member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
}

function checkModerator(member: GuildMember, settings: GuildEntity) {
	const roles = settings[GuildSettings.Roles.Moderator];
	return roles.length === 0 ? member.permissions.has(Permissions.FLAGS.BAN_MEMBERS) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
}

function checkAdministrator(member: GuildMember, settings: GuildEntity) {
	const roles = settings[GuildSettings.Roles.Admin];
	return roles.length === 0 ? member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
}
