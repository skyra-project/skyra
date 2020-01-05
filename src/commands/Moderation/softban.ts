import { isNumber } from '@klasa/utils';
import { ModerationCommand } from '@lib/structures/ModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sb'],
			description: language => language.tget('COMMAND_SOFTBAN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SOFTBAN_EXTENDED'),
			requiredMember: false,
			requiredPermissions: ['BAN_MEMBERS']
		});
	}

	public prehandle(message: KlasaMessage) {
		return message.guild!.settings.get(GuildSettings.Events.BanAdd) || message.guild!.settings.get(GuildSettings.Events.BanRemove)
			? { unlock: message.guild!.moderation.createLock() }
			: null;
	}

	public handle(message: KlasaMessage, target: User, reason: string | null, duration: number | null) {
		return message.guild!.security.actions.softBan({
			user_id: target.id,
			moderator_id: message.author.id,
			duration,
			reason
		}, this.getDays(message), this.getTargetDM(message, target));
	}

	public posthandle(_: KlasaMessage, __: User[], ___: string, prehandled: Unlock) {
		if (prehandled) prehandled.unlock();
	}

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: Unlock) {
		const member = await super.checkModeratable(message, target, prehandled);
		if (member && !member.bannable) throw message.language.tget('COMMAND_BAN_NOT_BANNABLE');
		return member;
	}

	private getDays(message: KlasaMessage) {
		const regex = message.language.tget('COMMAND_MODERATION_DAYS');
		for (const [key, value] of Object.entries(message.flagArgs)) {
			if (regex.test(key)) {
				const parsed = Number(value);
				if (isNumber(parsed) && parsed >= 0 && parsed <= 7) return parsed;
			}
		}
		return 0;
	}

}

interface Unlock {
	unlock(): void;
}
