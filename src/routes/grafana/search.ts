import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { Grafana } from '@lib/types/definitions/Grafana';
import { ApplyOptions } from '@skyra/decorators';
import { grafanaAuthenticated, ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'search' })
export default class extends Route {

	@grafanaAuthenticated
	@ratelimit(2, 2500)
	public post(_request: ApiRequest, response: ApiResponse) {
		return response.json([Grafana.TimeSeriesTargets.Guilds, Grafana.TimeSeriesTargets.Users]);
	}

}
