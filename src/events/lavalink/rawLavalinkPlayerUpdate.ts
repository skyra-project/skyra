import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingPlayerUpdatePayload } from '@skyra/audio';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'audio', event: 'playerUpdate' })
export default class extends Event {
	public async run(payload: IncomingPlayerUpdatePayload) {
		const queue = this.context.client.audio.queues!.get(payload.guildId);
		if (payload.state.position === 0) {
			await queue.store.redis.del(queue.keys.position);
		} else {
			await queue.store.redis.set(queue.keys.position, payload.state.position);
			await queue.refresh();
		}
	}
}
