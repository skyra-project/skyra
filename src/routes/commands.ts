import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { isFunction, isPrimitive } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'commands' })
export default class extends Route {
	@ratelimit(2, 2500)
	public get(request: ApiRequest, response: ApiResponse) {
		const { lang, category } = request.query;
		const language = (lang && this.client.languages.get(lang as string)) ?? this.client.languages.default;
		const commands = (category ? this.client.commands.filter((cmd) => cmd.category === category) : this.client.commands).filter(
			(cmd) => cmd.permissionLevel < 9
		);

		const serializedCommands = commands.map((cmd) => ({
			bucket: cmd.bucket,
			category: cmd.category,
			cooldown: cmd.cooldown,
			description: isFunction(cmd.description) && !isPrimitive(language) ? cmd.description(language) : cmd.description,
			guarded: cmd.guarded,
			guildOnly: !cmd.runIn.includes('dm'),
			name: cmd.name,
			permissionLevel: cmd.permissionLevel,
			requiredPermissions: cmd.requiredPermissions.toArray(),
			usage: cmd.usageString
		}));
		return response.json(serializedCommands);
	}
}
