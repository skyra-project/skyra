import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { Mime } from '../../lib/util/constants';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import { Events } from '../../lib/types/Enums';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'twitch/stream_change/:id' });
	}

	// CHALlENGE
	public get(request: ApiRequest, response: ApiResponse) {
		const challenge = request.query['hub.challenge'] as string | undefined;

		switch (request.query['hub.mode']) {
			case 'denied': return response.setContentType(Mime.Types.TextPlain).ok(challenge || 'ok');
			case 'unsubscribe':
			case 'subscribe': return response.setContentType(Mime.Types.TextPlain).ok(challenge);
			default: return response.error("Well... Isn't this a pain in the ass");
		}
	}

	// Stream Changed
	public post(request: ApiRequest, response: ApiResponse) {
		if (!Array.isArray(request.body)) return response.badRequest('Malformed data received');

		const xHubSignature = request.headers['X-Hub-Signature'];
		if (typeof xHubSignature === 'undefined') return response.badRequest('Missing "X-Hub-Signature" header');

		const data = request.body as StreamBody[];
		const [algo, sig] = xHubSignature.toString().split('=', 2);

		if (!this.client.twitch.checkSignature(algo, sig, data)) return response.forbidden('Invalid Hub signature');

		const id = request.query.id as string;

		if (data.length === 0) {
			this.client.emit(Events.TwitchStreamOffline, { id }, response);
		} else {
			this.client.emit(Events.TwitchStreamOnline, data, response);
		}
	}

}

export interface StreamBody {
	id: string;
	user_id?: string;
	user_name?: string;
	game_id?: string;
	community_ids?: string[];
	type?: 'live' | '';
	title?: string;
	viewer_count?: number;
	started_at?: string;
	language?: string;
	thumbnail_url?: string;
}
