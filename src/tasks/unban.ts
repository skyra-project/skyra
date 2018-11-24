import { Permissions } from 'discord.js';
import { KlasaGuild, KlasaUser, Task } from 'klasa';
import { ModerationTypesEnum } from '../lib/structures/ModerationManager';
import { MODERATION } from '../lib/util/constants';

const { TYPE_KEYS, SCHEMA_KEYS } = MODERATION;
const { FLAGS } = Permissions;

export default class extends Task {

	public async run(doc: any): Promise<void> {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc[SCHEMA_KEYS.GUILD]);
		if (!guild || !guild.me.permissions.has(FLAGS.BAN_MEMBERS)) return;

		// Fetch the user to unban
		const userID = doc[SCHEMA_KEYS.USER];
		// @ts-ignore
		const reason = `Ban released after ${this.client.languages.default.duration(doc[SCHEMA_KEYS.DURATION])}`;

		// Unban the user and send the modlog
		const banLog = await this._fetchBanLog(guild, userID);
		if (banLog) await guild.members.unban(userID, `[AUTO] ${reason}`);
		await guild.moderation.new
			.setModerator(this.client.user.id)
			.setUser(userID)
			.setType(TYPE_KEYS.UN_BAN as ModerationTypesEnum)
			.setReason(banLog && banLog.reason ? `${reason}\nReason for ban: ${banLog.reason}` : reason)
			.create();
	}

	public async _fetchBanLog(guild: KlasaGuild, userID: string): Promise<{ user: KlasaUser; reason?: string }> {
		const users = await guild.fetchBans();
		return users.get(userID) || null;
	}

}
