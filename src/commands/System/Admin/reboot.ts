import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { Events, PermissionLevels } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { envParseBoolean } from '@skyra/env-utilities';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.RebootDescription,
	detailedDescription: LanguageKeys.Commands.System.RebootExtended,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		const content = args.t(LanguageKeys.Commands.System.Reboot);
		await send(message, content).catch((error) => this.container.logger.fatal(error));

		if (envParseBoolean('INFLUX_ENABLED')) {
			const { client } = this.container;
			try {
				client.emit(
					Events.AnalyticsSync,
					client.guilds.cache.size,
					client.guilds.cache.reduce((acc, val) => acc + val.memberCount, 0)
				);

				await client.analytics!.writeApi.flush();
				await client.analytics!.writeApi.close();
			} catch {
				// noop
			}
		}

		process.exit(0);
	}
}
