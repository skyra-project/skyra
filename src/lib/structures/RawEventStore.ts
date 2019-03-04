import { Client, Constants, WSEventType } from 'discord.js';
import { Store } from 'klasa';
import { Events } from '../types/Enums';
import { RawEvent } from './RawEvent';

export class RawEventStore extends Store<string, RawEvent, typeof RawEvent> {

	public constructor(client: Client) {
		// @ts-ignore
		super(client, 'rawEvents', RawEvent);
	}

	public run(data: { t: WSEventType; d: unknown }): void {
		const piece = data.d && super.get(Constants.Events[data.t]);
		// tslint:disable-next-line:no-floating-promises
		if (piece) this._run(piece, data.d);
	}

	/**
	 * Run a RawEvent
	 * @param piece The piece to run
	 * @param data The data payload
	 */
	public async _run(piece: RawEvent, data: unknown): Promise<void> {
		try {
			await piece.run(data);
		} catch (error) {
			this.client.emit(Events.Error, `[RAWEVENT] ${piece.path}\n${error
				? error.stack ? error.stack : error : 'Unknown error'}`);
		}
	}

}

// TODO: Remove once https://github.com/discordjs/discord.js/pull/3124 merges
if (!('VOICE_SERVER_UPDATE' in Constants.Events)) Object.assign(Constants.Events, { VOICE_SERVER_UPDATE: 'voiceServerUpdate' });
if (!('VOICE_STATE_UPDATE' in Constants.WSEvents)) Object.assign(Constants.WSEvents, { VOICE_STATE_UPDATE: 'VOICE_STATE_UPDATE' });

declare module 'discord.js' {
	const Constants: {
		Events: Record<WSEventType, string>;
		WSEvents: Record<WSEventType, WSEventType>;
	};
}
