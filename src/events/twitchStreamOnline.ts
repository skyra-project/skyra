import { Event } from 'klasa';
import ApiResponse from '../lib/structures/api/ApiResponse';
import { StreamBody } from '../routes/twitch/twitchStreamChange';
import { TwitchHelixGameSearchResult } from '../lib/types/definitions/Twitch';
import { TWITCH_REPLACEABLES_MATCHES } from '../lib/util/Notifications/Twitch';

const REGEXP = /%TITLE%|%VIEWER_COUNT%|%GAME_NAME%|%LANGUAGE%|%GAME_ID%|%USER_ID%|%USER_NAME%/g;

export default class extends Event {

	public async run(data: StreamBody, response: ApiResponse) {
		const [game] = await this.client.twitch.fetchGame([data.game_id!]);
	}

	private transformText(str: string, notification: StreamBody, game: TwitchHelixGameSearchResult) {
		return str.replace(REGEXP, match => {
			switch (match) {
				case TWITCH_REPLACEABLES_MATCHES.TITLE: return notification.title!;
				case TWITCH_REPLACEABLES_MATCHES.VIEWER_COUNT: return notification.viewer_count!.toString();
				case TWITCH_REPLACEABLES_MATCHES.GAME_NAME: return game.name;
				case TWITCH_REPLACEABLES_MATCHES.LANGUAGE: return notification.language!;
				case TWITCH_REPLACEABLES_MATCHES.GAME_ID: return notification.game_id!;
				case TWITCH_REPLACEABLES_MATCHES.USER_ID: return notification.user_id!;
				case TWITCH_REPLACEABLES_MATCHES.USER_NAME: return notification.user_name!;
				default: return match;
			}
		});
	}

}
