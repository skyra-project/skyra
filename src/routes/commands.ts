import { ratelimit } from '#lib/api/utils';
import type { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import type { TFunction } from 'i18next';
import type { Command } from 'klasa';

@ApplyOptions<RouteOptions>({ route: 'commands' })
export default class UserRoute extends Route {
	@ratelimit(2, 2500)
	public [methods.GET](request: ApiRequest, response: ApiResponse) {
		const { lang, category } = request.query;
		const { client } = this.context;
		const language = client.i18n.fetchT((lang as string) ?? 'en-US');
		const commands = (category ? client.commands.filter((cmd) => cmd.category === category) : client.commands).filter(
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
