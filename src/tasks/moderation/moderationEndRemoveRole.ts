import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, ModerationTask, type ModerationData } from '#lib/moderation';
import { fetchT } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits, type Guild, type Role } from 'discord.js';

export class UserModerationTask extends ModerationTask {
	protected async handle(guild: Guild, data: ModerationData<{ role: Role }>) {
		const me = guild.members.me ?? (await guild.members.fetch(this.container.client.id!));
		if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) return null;

		const t = await fetchT(guild);
		const reason = `[MODERATION] Role re-added after ${t(LanguageKeys.Globals.DurationValue, { value: data.duration })}`;
		const actionData = await this.getActionData(guild, data.userID, data.extraData.role);
		await ModerationActions.roleRemove.undo(guild, { userId: data.userID, reason }, actionData);
		return null;
	}
}
