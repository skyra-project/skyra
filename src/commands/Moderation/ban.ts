import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_BAN_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_BAN_EXTENDED'),
			modType: ModerationTypeKeys.Ban,
			permissionLevel: 5,
			requiredMember: false,
			requiredPermissions: ['BAN_MEMBERS'],
			flagSupport: true
		});
	}

	public async prehandle(message: KlasaMessage) {
		return message.guild.settings.get(GuildSettings.Events.BanAdd) ? { unlock: message.guild.moderation.createLock() } : null;
	}

	public async handle(message: KlasaMessage, user: User, member: SkyraGuildMember, reason: string) {
		if (member && !member.bannable) throw message.language.get('COMMAND_BAN_NOT_BANNABLE');
		await message.guild.members.ban(user.id, { days: (message.flags.day && Number(message.flags.day)) || 0, reason });

		return this.sendModlog(message, user, reason);
	}

	public async posthandle(_: KlasaMessage, __: User[], ___: string, prehandled: Unlock) {
		if (prehandled) prehandled.unlock();
	}

}

interface Unlock {
	unlock(): void;
}
