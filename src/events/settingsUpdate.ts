import { Event, Settings } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { SkyraGuild } from '../lib/extensions/SkyraGuild';
import { getFromPath } from '../lib/util/util';

export default class extends Event {

	public run(settings: Settings, changes: Record<string, unknown>) {
		// If the synchronized settings isn't from the guilds gateway, return early.
		if (settings.gateway.name !== 'guilds') return;

		const blockedWords = getFromPath(changes, GuildSettings.Selfmod.Filter.Raw) as GuildSettings.Selfmod.Filter.Raw | undefined;

		// If the changes do not include updating the raw filter, return early too.
		if (typeof blockedWords === 'undefined') return;

		const guild = settings.target as SkyraGuild;
		if (blockedWords.length) guild!.security.updateRegExp(blockedWords);
		else guild!.security.regexp = null;
	}

}
