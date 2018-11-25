// Copyright (c) 2018 BDISTIN. All rights reserved. MIT license.
import { Event, KlasaMessage } from 'klasa';
import { ModerationTypeKeys } from '../lib/util/constants';

export default class extends Event {

	public async run(message: KlasaMessage): Promise<void> {
		const lock = message.guild.moderation.createLock();
		await message.guild.members.ban(message.author.id, { days: 0, reason: message.language.get('CONST_MONITOR_NMS') }).catch((error) => this.client.emit('apiError', error));
		await message.sendLocale('MONITOR_NMS_MESSAGE', [message.author]).catch((error) => this.client.emit('apiError', error));
		message.guild.security.nms.delete(message.author.id);

		try {
			await message.guild.moderation.new
				.setModerator(this.client.user)
				.setUser(message.author)
				.setType(ModerationTypeKeys.Ban)
				.setReason(message.language.get('MONITOR_NMS_MODLOG', message.guild.settings.get('selfmod.nmsthreshold')))
				.create();
		} catch (error) {
			this.client.emit('wtf', error);
		} finally {
			lock();
		}
	}

}
