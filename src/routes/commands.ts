import { ratelimit } from '#lib/api/utils';
import type { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import type { TFunction } from 'i18next';

@ApplyOptions<RouteOptions>({ route: 'commands' })
export default class UserRoute extends Route {
	@ratelimit(2, 2500)
	public [methods.GET](request: ApiRequest, response: ApiResponse) {
		const { lang, category } = request.query;
		const { client, stores } = this.context;
		const language = client.i18n.fetchT((lang as string) ?? 'en-US');
		const commands = (category
			? stores.get('commands').filter((cmd) => (cmd as SkyraCommand).category === category)
			: stores.get('commands')
		).filter((cmd) => (cmd as SkyraCommand).permissionLevel < 9);

		return response.json(commands.map(UserRoute.process.bind(null, language)));
	}

	private static process(t: TFunction, cmd: Command) {
		const command = cmd as SkyraCommand;
		return {
			category: command.category,
			description: t(command.description),
			extendedHelp: t(command.extendedHelp),
			guarded: command.guarded,
			name: command.name,
			permissionLevel: command.permissionLevel,
			preconditions: command.preconditions
		};
	}
}
