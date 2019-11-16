import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { Mime } from '../../lib/util/constants';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'twitch/:id' });
	}

	// CHALENGE
	public get(request: ApiRequest, response: ApiResponse) {

		const challenge = request.query['hub.challenge'] as string | undefined;

		switch (request.query['hub.mode']) {
			case 'denied': return response.setContentType(Mime.Types.TextPlain).ok(challenge ?? 'ok');
			case 'unsubscribe':
			case 'subscribe': return response.setContentType(Mime.Types.TextPlain).ok(challenge);
			default: return "Well... Isn't this a pain in the ass";
		}
	}

}
