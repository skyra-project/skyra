import { AudioListener, OutgoingWebSocketAction, Queue } from '#lib/audio';
import { GuildSettings, readSettings } from '#lib/database';
import { Events } from '#lib/types/Enums';

export class UserAudioListener extends AudioListener {
	public async run(queue: Queue) {
		const channel = await queue.getTextChannel();
		if (channel) this.container.client.emit(Events.MusicFinishNotify, channel);

		// If auto-leave is enabled, leave the voice channel:
		if (await readSettings(queue.guildId, GuildSettings.Music.AutoLeave)) {
			await queue.leave();
		}

		await queue.clear();

		return this.broadcastMessageForGuild(queue.guildId, () => ({
			action: OutgoingWebSocketAction.MusicFinish
		}));
	}
}
