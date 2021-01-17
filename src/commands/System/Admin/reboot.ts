import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { ENABLE_INFLUX } from '#root/config';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.RebootDescription,
	extendedHelp: LanguageKeys.Commands.System.RebootExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		await message.sendTranslated(LanguageKeys.Commands.System.Reboot).catch((err) => this.client.emit(Events.ApiError, err));

		if (ENABLE_INFLUX) {
			try {
				this.client.emit(
					Events.AnalyticsSync,
					this.client.guilds.cache.size,
					this.client.guilds.cache.reduce((acc, val) => acc + val.memberCount, 0)
				);

				await this.client.analytics!.writeApi.flush();
				await this.client.analytics!.writeApi.close();
			} catch {
				// noop
			}
		}

		process.exit(0);
	}
}
