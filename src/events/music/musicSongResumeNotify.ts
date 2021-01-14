import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { MessageAcknowledgeable } from '#lib/types';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable) {
		await channel.sendTranslated(LanguageKeys.Commands.Music.ResumeSuccess);
	}
}
