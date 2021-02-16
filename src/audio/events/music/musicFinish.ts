import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';
import { Events } from '#lib/types/Enums';

export class UserAudioEvent extends AudioEvent {
	public async run(queue: Queue) {
		const channel = await queue.getTextChannel();
		if (channel) this.context.client.emit(Events.MusicFinishNotify, channel);

		await queue.leave();
		await queue.clear();

		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebSocketAction.MusicFinish
		}));
	}
}
