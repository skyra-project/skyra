import { GuildEntity, readSettings, writeSettings } from '#lib/database';
import { Events } from '#lib/types';
import { toErrorCodeResult } from '#utils/common';
import { getCodeStyle, getLogPrefix } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits, RESTJSONErrorCodes, type GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.NotMutedMemberAdd })
export class UserListener extends Listener {
	public async run(member: GuildMember) {
		// If the bot cannot manage roles, do not proceed:
		if (!this.canGiveRoles(member)) return;

		const settings = await readSettings(member);
		const initial = settings.rolesInitial;
		const initialHumans = settings.rolesInitialHumans;
		const initialBots = settings.rolesInitialBots;
		const roleId = initial ?? (member.user.bot ? initialBots : initialHumans);
		if (!roleId) return;

		const result = await toErrorCodeResult(member.roles.add(roleId));
		// If the role was not found or the bot can't give the role, remove it from the settings:
		if (result.isErrAnd((code) => code === RESTJSONErrorCodes.UnknownRole || code === RESTJSONErrorCodes.MissingPermissions)) {
			const key: keyof GuildEntity = initial //
				? 'rolesInitial'
				: member.user.bot
					? 'rolesInitialBots'
					: 'rolesInitialHumans';
			return writeSettings(member, [[key, null]]);
		}

		// In any other case, log the error as unexpected:
		result.inspectErr((code) => this.container.logger.error(`${getLogPrefix(this)} Failed to give role: ${getCodeStyle(code)}`));
	}

	private canGiveRoles(member: GuildMember) {
		const permissions = member.guild.members.me?.permissions;
		return !isNullish(permissions) && permissions.has(PermissionFlagsBits.ManageRoles);
	}
}
