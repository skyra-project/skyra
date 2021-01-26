import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { ENABLE_INFLUX } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.RebootDescription,
	extendedHelp: LanguageKeys.Commands.System.RebootExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message) {
		await message.sendTranslated(LanguageKeys.Commands.System.Reboot).catch((err) => this.context.client.emit(Events.ApiError, err));

		if (ENABLE_INFLUX) {
			const { client } = this.context;
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
