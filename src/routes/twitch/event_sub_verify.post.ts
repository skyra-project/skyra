import { Events, TwitchStreamStatus } from '#lib/types';
import { cast } from '#utils/util';
import { Route } from '@sapphire/plugin-api';
import { isObject } from '@sapphire/utilities';
import { TwitchEventSubTypes, checkSignature, type TwitchEventSubVerificationMessage } from '@skyra/twitch-helpers';

export class UserRoute extends Route {
	private lastNotificationId: string | null = null;

	// Stream Changed
	public async run(request: Route.Request, response: Route.Response) {
		// Grab the headers that we need to use for verification
		const twitchEventSubMessageSignature = cast<string>(request.headers['twitch-eventsub-message-signature']);
		const twitchEventSubMessageId = cast<string>(request.headers['twitch-eventsub-message-id']);
		const twitchEventSubMessageTimestamp = cast<string>(request.headers['twitch-eventsub-message-timestamp']);

		// If this notification is the same as before, then send ok back
		if (this.lastNotificationId && this.lastNotificationId === twitchEventSubMessageId) return response.ok();

		const text = await request.readBodyText();
		const body = JSON.parse(text);

		// If there is no body then tell Twitch they are sending malformed data
		if (!isObject(body)) return response.badRequest('Malformed data received');

		// If any of the headers is missing tell Twitch they are sending invalid data
		if (!twitchEventSubMessageSignature || !twitchEventSubMessageId || !twitchEventSubMessageTimestamp) {
			return response.badRequest('Missing required Twitch Eventsub headers');
		}

		// Construct the verification signature
		const twitchEventSubMessage = twitchEventSubMessageId + twitchEventSubMessageTimestamp + text;

		// Split the algorithm from the signature
		const [algorithm, signature] = twitchEventSubMessageSignature.toString().split('=', 2);

		// Verify the signature
		if (!checkSignature(algorithm, signature, twitchEventSubMessage)) {
			return response.forbidden('Invalid Hub signature');
		}

		// Destructure the properties that we need from the body
		const {
			challenge,
			subscription: { type },
			event
		} = body as TwitchEventSubVerificationMessage;

		// Tell the Twitch API this response was OK, then continue processing the request
		response.text(challenge);

		// If there is an event then this is an online or offline notification
		// If there is no event this is an endpoint verification request
		if (event) {
			const { client } = this.container;
			if (type === TwitchEventSubTypes.StreamOnline) {
				client.emit(Events.TwitchStreamHookedAnalytics, TwitchStreamStatus.Online);
				client.emit(Events.TwitchStreamOnline, event);
			} else {
				client.emit(Events.TwitchStreamHookedAnalytics, TwitchStreamStatus.Offline);
				client.emit(Events.TwitchStreamOffline, event);
			}
		}

		// Store the last notification id
		this.lastNotificationId = twitchEventSubMessageId;
	}
}
