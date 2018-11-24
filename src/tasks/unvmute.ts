import { Permissions } from 'discord.js';
import { Task } from 'klasa';
import { ModerationTypesEnum } from '../lib/structures/ModerationManager';
import { MODERATION } from '../lib/util/constants';

const { TYPE_KEYS, SCHEMA_KEYS } = MODERATION;
const { FLAGS } = Permissions;

export default class extends Task {

	public async run(doc: any): Promise<void> {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc[SCHEMA_KEYS.GUILD]);
		if (!guild || !guild.me.permissions.has(FLAGS.MUTE_MEMBERS)) return;

		// Fetch the user to unban
		const user = await this.client.users.fetch(doc[SCHEMA_KEYS.USER]);
		const member = await guild.members.fetch(user).catch(() => null);
		// @ts-ignore
		const reason = `Mute released after ${this.client.languages.default.duration(doc[SCHEMA_KEYS.DURATION])}`;

		if (member && member.serverMute) await member.setDeaf(false, `[AUTO] ${reason}`);

		// Send the modlog
		await guild.moderation.new
			.setModerator(this.client.user.id)
			.setUser(user)
			.setType(TYPE_KEYS.UN_VOICE_MUTE as ModerationTypesEnum)
			.setReason(member ? reason : `${reason}\n**Skyra**: But the member was away.`)
			.create();
	}

}
