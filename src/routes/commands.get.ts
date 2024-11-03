import { ratelimit } from '#lib/api/utils';
import { getT } from '#lib/i18n/translate';
import type { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types';
import { seconds } from '#utils/common';
import type { Command } from '@sapphire/framework';
import { Route } from '@sapphire/plugin-api';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { LocaleString } from 'discord.js';

export class UserRoute extends Route {
	@ratelimit(seconds(2), 2)
	public run(request: Route.Request, response: Route.Response) {
		const { lang, category } = request.query;
		const commands = this.container.stores.get('commands');
		const language = getT(lang as LocaleString);
		const filtered = (category ? commands.filter((cmd) => cmd.category === category) : commands).filter(
			(cmd) => (cmd as SkyraCommand).permissionLevel < PermissionLevels.BotOwner
		);

		return response.json(filtered.map(UserRoute.process.bind(null, language)));
	}

	private static process(t: TFunction, cmd: Command) {
		const command = cmd as SkyraCommand;
		return {
			category: command.category,
			description: t(command.description),
			extendedHelp: t(command.detailedDescription, { prefix: process.env.CLIENT_PREFIX }),
			guarded: command.guarded,
			name: command.name,
			permissionLevel: command.permissionLevel,
			preconditions: command.preconditions
		};
	}
}
