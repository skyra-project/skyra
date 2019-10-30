import { Permissions } from 'discord.js';
import { KlasaGuild, Task } from 'klasa';
import { Moderation } from '../lib/util/constants';
import { api } from '../lib/util/Models/Api';
import { APIBanData } from '../lib/types/DiscordAPI';
const { FLAGS } = Permissions;

export default class extends Task {

	public async run(doc: UnbanTaskData) {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc.guildID);
		if (!guild || !guild.me!.permissions.has(FLAGS.BAN_MEMBERS)) return;

		// Fetch the user to unban
		const { userID } = doc;
		const reason = `Ban released after ${this.client.languages.default.duration(doc.duration)}`;

		// Unban the user and send the modlog
		const banLog = await this._fetchBanLog(guild, userID);
		if (banLog) await guild.members.unban(userID, `[AUTO] ${reason}`);
		await guild.moderation.create({
			user_id: userID,
			moderator_id: this.client.user!.id,
			type: Moderation.TypeCodes.UnBan,
			reason: banLog && banLog.reason ? `${reason}\nReason for ban: ${banLog.reason}` : reason
		}).create();
	}

	public async _fetchBanLog(guild: KlasaGuild, userID: string) {
		try {
			return await api(this.client).guilds(guild.id).bans(userID)
				.get() as APIBanData;
		} catch {
			return null;
		}
	}

}

interface UnbanTaskData {
	[Moderation.SchemaKeys.Guild]: string;
	[Moderation.SchemaKeys.User]: string;
	[Moderation.SchemaKeys.Duration]: number;
}
