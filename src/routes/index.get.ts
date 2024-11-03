import { Route } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	public run(_request: Route.Request, response: Route.Response) {
		response.json({ message: 'Hello World' });
	}
}
