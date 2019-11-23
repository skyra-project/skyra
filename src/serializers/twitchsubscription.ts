import { Language, SchemaEntry, Serializer } from 'klasa';
import { NotificationsStreamTwitch, NotificationsStreamsTwitchStreamer } from '../lib/types/settings/GuildSettings';

export default class extends Serializer {

	public deserialize(data: NotificationsStreamTwitch, _: SchemaEntry, language: Language) {
		// Validate that data is a tuple [string, x[]].
		if (!Array.isArray(data) || data.length !== 2 || typeof data[0] !== 'string' || !Array.isArray(data[1])) {
			return Promise.reject(language.tget('SERIALIZER_TWITCH_SUBSCRIPTION_INVALID'));
		}

		// Validate that all entries from the second index in the tuple are indeed correct values.
		if (data[1].some(streamer => !this.validateStreamer(streamer))) {
			return Promise.reject(language.tget('SERIALIZER_TWITCH_SUBSCRIPTION_INVALID_STREAMER'));
		}

		// Return without further modifications
		return Promise.resolve(data);
	}

	public stringify(value: NotificationsStreamTwitch) {
		return value[0];
	}

	private validateStreamer(data: NotificationsStreamsTwitchStreamer) {
		return typeof data.$ID === 'string'
			&& typeof data.channel === 'string'
			&& typeof data.author === 'string'
			&& typeof data.message === 'string'
			&& typeof data.embed === 'string'
			&& typeof data.status === 'number'
			&& typeof data.createdAt === 'number'
			&& Array.isArray(data.gamesWhitelist)
			&& data.gamesWhitelist.every(game => typeof game === 'string')
			&& Array.isArray(data.gamesBlacklist)
			&& data.gamesBlacklist.every(game => typeof game === 'string');
	}

}
