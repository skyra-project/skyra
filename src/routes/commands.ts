import { ratelimit } from '#lib/api/utils';
import type { SkyraCommand } from '#lib/structures';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import type { Command } from '@sapphire/framework';
import { Route, methods, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import type { TFunction } from 'i18next';

@ApplyOptions<Route.Options>({ route: 'commands' })
export class UserRoute extends Route {
	@ratelimit(seconds(2), 2)
	public [methods.GET](request: ApiRequest, response: ApiResponse) {
		const { lang, category } = request.query;
		const { i18n, stores } = this.container;
		const language = i18n.getT((lang as string) ?? 'en-US');
		const commands = (
			category ? stores.get('commands').filter((cmd) => (cmd as SkyraCommand).category === category) : stores.get('commands')
		).filter((cmd) => (cmd as SkyraCommand).permissionLevel < 9);

		return response.json(commands.map(UserRoute.process.bind(null, language)));
	}

	private static process(t: TFunction, cmd: Command) {
		const command = cmd as SkyraCommand;
		return {
			category: command.category,
			description: t(command.description),
			extendedHelp: t(command.detailedDescription, {
				replace: { prefix: process.env.CLIENT_PREFIX },
				postProcess: 'helpUsagePostProcessor'
			}) as string,
			guarded: command.guarded,
			name: command.name,
			permissionLevel: command.permissionLevel,
			preconditions: command.preconditions
		};
	}
}
