import { Event } from 'klasa';
import ApiResponse from '../lib/structures/api/ApiResponse';
import { StreamBody } from '../routes/twitch/twitchStreamChange';

export default class extends Event {

	public async run(data: StreamBody, response: ApiResponse) {
	}

}
