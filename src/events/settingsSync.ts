import { Event, Settings } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { SkyraGuild } from '../lib/extensions/SkyraGuild';

export default class extends Event {

	public run(settings: Settings) {
		// If the synchronized settings isn't from the guilds gateway, return early.
		if (settings.gateway.name !== 'guilds') return;

		const blockedWords = settings.get(GuildSettings.Selfmod.Filter.Raw) as GuildSettings.Selfmod.Filter.Raw;
		const guild = settings.target as SkyraGuild;
		if (blockedWords.length) guild!.security.updateRegExp(blockedWords);
		else guild!.security.regexp = null;
	}

}
