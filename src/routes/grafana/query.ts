import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { Grafana } from '@lib/types/definitions/Grafana';
import { ApplyOptions } from '@skyra/decorators';
import { grafanaAuthenticated, ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'query' })
export default class extends Route {

	@grafanaAuthenticated
	@ratelimit(2, 2500)
	public post(request: ApiRequest<Grafana.Body>, response: ApiResponse) {
		const requestBody = request.body!;

		const data: Grafana.TimeSeriesResponse[] = [];

		for (const grafanaTarget of requestBody.targets) {
			switch (grafanaTarget.target) {
				case Grafana.TimeSeriesTargets.Guilds:
					data.push(this.retrieveGuildDatapoints());
					break;
				case Grafana.TimeSeriesTargets.Users:
					data.push(this.retrieveUsersDatapoints());
					break;
			}
		}

		return response.json(data);
	}

	private retrieveGuildDatapoints() {
		const dummyGuildData: Grafana.TimeSeriesResponse['datapoints'] = [
			[1500, 1590138454405],
			[1505, 1590138883262],
			[1504, 1590138896067],
			[1510, 1590138902384],
			[1550, 1590138908672]
		];

		return { target: Grafana.TimeSeriesTargets.Guilds, datapoints: dummyGuildData };
	}

	private retrieveUsersDatapoints() {
		const dummyUserData: Grafana.TimeSeriesResponse['datapoints'] = [
			[1660, 1590138454405],
			[1536, 1590138883262],
			[1853, 1590138896067],
			[1754, 1590138902384],
			[1695, 1590138908672]
		];

		return { target: Grafana.TimeSeriesTargets.Users, datapoints: dummyUserData };
	}

}
