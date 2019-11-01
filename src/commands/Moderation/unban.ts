import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { Moderation } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_UNBAN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_UNBAN_EXTENDED'),
			modType: Moderation.TypeCodes.UnBan,
			permissionLevel: 5,
			requiredMember: false,
			requiredPermissions: ['BAN_MEMBERS']
		});
	}

	public async prehandle(message: KlasaMessage) {
		const bans = await message.guild!.fetchBans()
			.then(result => result.map(ban => ban.user.id))
			.catch(() => { throw message.language.tget('SYSTEM_FETCHBANS_FAIL'); });
		if (bans.length) return { bans, unlock: message.guild!.settings.get(GuildSettings.Events.BanRemove) ? message.guild!.moderation.createLock() : null };
		throw message.language.tget('GUILD_BANS_EMPTY');
	}

	public handle(message: KlasaMessage, target: User, _member: GuildMember, reason: string | null, _prehandled: Unlock, duration: number | null) {
		return message.guild!.security.actions.unBan({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		});
	}

	public posthandle(_: KlasaMessage, __: User[], ___: string, prehandled: Unlock) {
		if (prehandled) prehandled.unlock();
	}

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: Unlock) {
		if (!prehandled.bans.includes(target.id)) throw message.language.tget('GUILD_BANS_NOT_FOUND');
		const member = await super.checkModeratable(message, target, prehandled);
		return member;
	}

}

interface Unlock {
	bans: string[];
	unlock(): void;
}
