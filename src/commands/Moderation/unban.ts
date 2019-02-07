import { User } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_UNBAN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UNBAN_EXTENDED'),
			modType: ModerationTypeKeys.UnBan,
			permissionLevel: 5,
			requiredMember: false,
			requiredPermissions: ['BAN_MEMBERS']
		});
	}

	public async prehandle(message: KlasaMessage) {
		const bans = await message.guild.fetchBans()
			.then((result) => result.map((ban) => ban.user.id))
			.catch(() => { throw message.language.get('SYSTEM_FETCHBANS_FAIL'); });
		if (bans.length) return { bans, unlock: message.guild.settings.get(GuildSettings.Events.BanRemove) ? message.guild.moderation.createLock() : null };
		throw message.language.get('GUILD_BANS_EMPTY');
	}

	public async handle(message: KlasaMessage, user: User, _: SkyraGuildMember, reason: string, { bans }: Unlock) {
		if (!bans.includes(user.id)) throw message.language.get('GUILD_BANS_NOT_FOUND');
		await message.guild.members.unban(user.id, reason);
		return this.sendModlog(message, user, reason);
	}

	public async posthandle(_: KlasaMessage, __: User[], ___: string, prehandled: Unlock) {
		if (prehandled) prehandled.unlock();
	}

}

interface Unlock {
	bans: string[];
	unlock(): void;
}
