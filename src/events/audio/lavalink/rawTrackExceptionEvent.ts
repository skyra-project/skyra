import { AudioEvent } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventTrackExceptionPayload } from '@skyra/audio';
import { magenta } from 'colorette';

@ApplyOptions<AudioEvent.Options>({ event: 'TrackExceptionEvent' })
export default class extends AudioEvent {
	private readonly kHeader = magenta('[LAVALINK]');

	public async run(payload: IncomingEventTrackExceptionPayload) {
		// Emit an error message if there is an error message to emit
		// The if case is because exceptions without error messages are pretty useless
		if (payload.exception) {
			this.context.client.logger.error([
				`${this.kHeader} Exception (${payload.guildId})`,
				`           Track: ${payload.track}`,
				`           Error: ${payload.exception.message} [${payload.exception.severity}]`
			]);
		}

		const queue = this.context.client.audio.queues!.get(payload.guildId);
		await queue.next();
	}
}
