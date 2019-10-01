import { Event, Settings, SettingsFolderUpdateResultEntry } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { SkyraGuild } from '../lib/extensions/SkyraGuild';

export default class extends Event {

	public run(settings: Settings, changes: readonly SettingsFolderUpdateResultEntry[]) {
		// If the synchronized settings isn't from the guilds gateway, return early.
		if (settings.gateway.name !== 'guilds') return;

		// If the changes do not include updating the raw filter, return early too.
		if (changes.every(change => change.entry.path !== GuildSettings.Filter.Raw)) return;

		const blockedWords = settings.get(GuildSettings.Filter.Raw) as GuildSettings.Filter.Raw;
		const guild = settings.target as SkyraGuild;
		if (blockedWords.length) guild!.security.updateRegExp(blockedWords);
		else guild!.security.regexp = null;
	}

}
