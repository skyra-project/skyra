import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import { Inhibitor, InhibitorOptions, RateLimitManager } from 'klasa';

@ApplyOptions<InhibitorOptions>({ spamProtection: true })
export default class extends Inhibitor {
	private readonly ratelimit = new RateLimitManager(1, 30000);

	public async run(message: Message, command: SkyraCommand) {
		if (!command.spam || !message.guild) return;

		const [channelID, t] = await message.guild.readSettings((settings) => [settings[GuildSettings.Channels.Spam], settings.getLanguage()]);
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
			throw t(LanguageKeys.Inhibitors.Spam, { channel: channel.toString() });
		}
	}
}
