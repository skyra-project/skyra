import { ApiRequest } from '#lib/api/ApiRequest';
import { ApiResponse } from '#lib/api/ApiResponse';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { ratelimit } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { TFunction } from 'i18next';
import { Command } from 'klasa';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({ route: 'commands' })
export default class UserRoute extends Route {
	@ratelimit(2, 2500)
	public get(request: ApiRequest, response: ApiResponse) {
		const { lang, category } = request.query;
		const language = this.client.i18n.fetchT((lang as string) ?? 'en-US');
		const commands = (category ? this.client.commands.filter((cmd) => cmd.category === category) : this.client.commands).filter(
			(cmd) => cmd.permissionLevel < 9
		);

		return response.json(commands.map(UserRoute.process.bind(null, language)));
	}

	private static process(t: TFunction, cmd: Command) {
		const command = cmd as SkyraCommand;
		return {
			bucket: command.bucket,
			category: command.category,
			cooldown: command.cooldown,
			description: t(command.description),
			extendedHelp: t(command.extendedHelp),
			guarded: command.guarded,
			guildOnly: !command.runIn.includes('dm'),
			name: command.name,
			permissionLevel: command.permissionLevel,
			requiredPermissions: command.requiredPermissions.toArray(),
			usage: command.usage.nearlyFullUsage
		};
	}
}
