import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { Mime } from '@utils/constants';
import { Route } from 'klasa-dashboard-hooks';

export abstract class PubSubHubbubRoute extends Route {

	public get(request: ApiRequest, response: ApiResponse) {
		const challenge = request.query['hub.challenge'] as string | undefined;
		switch (request.query['hub.mode']) {
			case 'denied': return response.setContentType(Mime.Types.TextPlain).ok(challenge ?? 'ok');
			case 'unsubscribe':
			case 'subscribe': return response.setContentType(Mime.Types.TextPlain).ok(challenge);
			default: return response.error("Well... Isn't this a pain in the ass");
		}
	}

}
