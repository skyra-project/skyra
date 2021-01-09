import { NotificationsStreamsTwitchStreamer, NotificationsStreamTwitch, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';

export default class UserSerializer extends Serializer<NotificationsStreamTwitch> {
	public parse(_: string, { t }: SerializerUpdateContext) {
		return this.error(t(LanguageKeys.Serializers.Unsupported));
	}

	public isValid(data: NotificationsStreamTwitch, { t }: SerializerUpdateContext) {
		// Validate that data is a tuple [string, x[]].
		if (!Array.isArray(data) || data.length !== 2 || typeof data[0] !== 'string' || !Array.isArray(data[1])) {
			return Promise.reject(t(LanguageKeys.Serializers.TwitchSubscriptionInvalid));
		}

		// Validate that all entries from the second index in the tuple are indeed correct values.
		if (data[1].some((streamer) => !this.validateStreamer(streamer))) {
			return Promise.reject(t(LanguageKeys.Serializers.TwitchSubscriptionInvalidStreamer));
		}

		// Return without further modifications
		return true;
	}

	public equals(left: NotificationsStreamTwitch, right: NotificationsStreamTwitch) {
		return left[0] === right[0];
	}

	public stringify(value: NotificationsStreamTwitch) {
		return value[0];
	}

	private validateStreamer(data: NotificationsStreamsTwitchStreamer) {
		return (
			typeof data.channel === 'string' &&
			typeof data.author === 'string' &&
			(typeof data.message === 'string' || data.message === null || data.message === undefined) &&
			typeof data.embed === 'boolean' &&
			typeof data.status === 'number' &&
			typeof data.createdAt === 'number' &&
			Array.isArray(data.gamesWhitelist) &&
			data.gamesWhitelist.every((game) => typeof game === 'string') &&
			Array.isArray(data.gamesBlacklist) &&
			data.gamesBlacklist.every((game) => typeof game === 'string')
		);
	}
}
