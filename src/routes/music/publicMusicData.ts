import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { ApplyOptions } from '@skyra/decorators';
import { flattenGuild, PublicFlattenedMusic } from '@utils/Models/ApiTransform';
import { ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'music/:guild/publicData' })
export default class extends Route {
	@ratelimit(2, 5000)
	public async get(request: ApiRequest, response: ApiResponse) {
		const guildID = request.params.guild;

		const guild = this.client.guilds.cache.get(guildID);
		if (!guild) return response.error(400);

		const flattenedGuild = flattenGuild(guild);
		const { audio } = guild;
		const tracks = await audio.decodedTracks();
		const nowPlaying = await audio.nowPlaying();

		return response.json<PublicFlattenedMusic>({
			guildData: {
				description: flattenedGuild.description,
				icon: flattenedGuild.icon,
				id: flattenedGuild.id,
				name: flattenedGuild.name,
				vanityURLCode: flattenedGuild.vanityURLCode
			},
			currentlyPlaying: nowPlaying?.entry.info,
			queueLength: tracks.length
		});
	}
}
