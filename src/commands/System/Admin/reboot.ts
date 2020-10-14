import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ENABLE_INFLUX } from '@root/config';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get(LanguageKeys.Commands.System.RebootDescription),
			guarded: true,
			permissionLevel: PermissionLevels.BotOwner
		});
	}

	public async run(message: KlasaMessage) {
		await message.sendLocale(LanguageKeys.Commands.System.Reboot).catch((err) => this.client.emit(Events.ApiError, err));

		try {
			if (ENABLE_INFLUX) {
				this.client.emit(
					Events.AnalyticsSync,
					this.client.guilds.cache.size,
					this.client.guilds.cache.reduce((acc, val) => acc + val.memberCount, 0)
				);

				await this.client.analytics!.writeApi.flush();
				await this.client.analytics!.writeApi.close();
			}

			this.client.destroy();
			await Promise.all(this.client.providers.map((provider) => provider.shutdown()));
		} catch {}

		process.exit(0);
	}
}
