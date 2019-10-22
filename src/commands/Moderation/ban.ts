import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_BAN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_BAN_EXTENDED'),
			flagSupport: true,
			modType: ModerationTypeKeys.Ban,
			optionalDuration: true,
			permissionLevel: 5,
			requiredMember: false,
			requiredGuildPermissions: ['BAN_MEMBERS']
		});
	}

	public prehandle(message: KlasaMessage) {
		return message.guild!.settings.get(GuildSettings.Events.BanAdd) ? { unlock: message.guild!.moderation.createLock() } : null;
	}

	public async handle(message: KlasaMessage, target: User, member: GuildMember, reason: string, _prehandled: Unlock, duration: number | null) {
		if (member && !member.bannable) throw message.language.tget('COMMAND_BAN_NOT_BANNABLE');
		await message.guild!.members.ban(target.id, { days: Number(message.flagArgs.day || message.flagArgs.days) || 0, reason });

		return this.sendModlog(message, target, reason, null, duration);
	}

	public posthandle(_: KlasaMessage, __: User[], ___: string, prehandled: Unlock) {
		if (prehandled) prehandled.unlock();
	}

}

interface Unlock {
	unlock(): void;
}
