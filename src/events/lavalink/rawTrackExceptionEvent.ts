import { Events } from '@lib/types/Enums';
import { IncomingEventTrackExceptionPayload } from '@skyra/audio';
import { ApplyOptions } from '@skyra/decorators';
import { magenta } from 'colorette';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: 'TrackExceptionEvent' })
export default class extends Event {
	private readonly kHeader = magenta('[LAVALINK]');

	public async run(payload: IncomingEventTrackExceptionPayload) {
		// Emit an error message if there is an error message to emit
		// The if case is because exceptions without error messages are pretty useless
		if (payload.exception) {
			this.client.emit(Events.Error, [
				`${this.kHeader} Exception (${payload.guildId})`,
				`           Track: ${payload.track}`,
				`           Error: ${payload.exception.message} [${payload.exception.severity}]`
			]);
		}

		const queue = this.client.audio.queues.get(payload.guildId);
		await queue.next();
	}
}
