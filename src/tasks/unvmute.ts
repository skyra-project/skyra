import { Permissions } from 'discord.js';
import { Task } from 'klasa';
import { ModerationSchemaKeys, ModerationTypeKeys } from '../lib/util/constants';
const { FLAGS } = Permissions;

export default class extends Task {

	public async run(doc: any): Promise<void> {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc[ModerationSchemaKeys.Guild]);
		if (!guild || !guild.me.permissions.has(FLAGS.MUTE_MEMBERS)) return;

		// Fetch the user to unban
		const user = await this.client.users.fetch(doc[ModerationSchemaKeys.User]);
		const member = await guild.members.fetch(user).catch(() => null);
		const reason = `Mute released after ${this.client.languages.default.duration(doc[ModerationSchemaKeys.Duration])}`;

		if (member && member.serverMute) await member.setDeaf(false, `[AUTO] ${reason}`);

		// Send the modlog
		await guild.moderation.new
			.setModerator(this.client.user.id)
			.setUser(user)
			.setType(ModerationTypeKeys.UnVoiceMute)
			.setReason(member ? reason : `${reason}\n**Skyra**: But the member was away.`)
			.create();
	}

}
