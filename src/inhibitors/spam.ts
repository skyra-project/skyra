import { GuildSettings } from '@lib/database';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Inhibitor, KlasaMessage, RateLimitManager } from 'klasa';

export default class extends Inhibitor {
	public spamProtection = true;

	private readonly ratelimit = new RateLimitManager(1, 30000);

	public async run(message: KlasaMessage, command: SkyraCommand) {
		if (!command.spam || !message.guild) return;

		const [channelID, language] = await message.guild.readSettings((settings) => [settings[GuildSettings.Channels.Spam], settings.getLanguage()]);
		if (!channelID) return;

		if (channelID === message.channel.id) return;
		if (await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator)) return;

		const channel = message.guild.channels.cache.get(channelID);
		if (!channel) {
			await message.guild.writeSettings([[GuildSettings.Channels.Spam, null]]);
			return;
		}

		try {
			this.ratelimit.acquire(message.channel.id).drip();
		} catch {
			throw language.get(LanguageKeys.Inhibitors.Spam, { channel: channel.toString() });
		}
	}
}
