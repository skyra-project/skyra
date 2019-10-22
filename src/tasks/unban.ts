import { Permissions } from 'discord.js';
import { KlasaGuild, Task } from 'klasa';
import { ModerationSchemaKeys, ModerationTypeKeys } from '../lib/util/constants';
const { FLAGS } = Permissions;

export default class extends Task {

	public async run(doc: UnbanTaskData) {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc[ModerationSchemaKeys.Guild]);
		if (!guild || !guild.me!.permissions.has(FLAGS.BAN_MEMBERS)) return;

		// Fetch the user to unban
		const userID = doc[ModerationSchemaKeys.User];
		const reason = `Ban released after ${this.client.languages.default.duration(doc[ModerationSchemaKeys.Duration])}`;

		// Unban the user and send the modlog
		const banLog = await this._fetchBanLog(guild, userID);
		if (banLog) await guild.members.unban(userID, `[AUTO] ${reason}`);
		await guild.moderation.create({
			user_id: userID,
			moderator_id: this.client.user!.id,
			type: ModerationTypeKeys.UnBan,
			reason: banLog && banLog.reason ? `${reason}\nReason for ban: ${banLog.reason}` : reason
		}).create();
	}

	public async _fetchBanLog(guild: KlasaGuild, userID: string) {
		const users = await guild.fetchBans();
		return users.get(userID) || null;
	}

}

interface UnbanTaskData {
	[ModerationSchemaKeys.Guild]: string;
	[ModerationSchemaKeys.User]: string;
	[ModerationSchemaKeys.Duration]: number;
}
