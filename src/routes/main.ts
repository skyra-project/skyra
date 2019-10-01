import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { authenticated } from '../lib/util/util';
import ApiRequest from '../lib/structures/api/ApiRequest';
import ApiResponse from '../lib/structures/api/ApiResponse';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: '' });
	}

	public get(_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}

    @authenticated
	public post(_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}

}
