import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { ModerationTypeKeys } from '../../lib/util/constants';
import { softban } from '../../lib/util/util';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_SOFTBAN_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_SOFTBAN_EXTENDED'),
			modType: ModerationTypeKeys.Softban,
			permissionLevel: 5,
			requiredMember: false,
			requiredPermissions: ['BAN_MEMBERS'],
			flagSupport: true
		});
	}

	public prehandle(message: KlasaMessage) {
		return message.guild!.settings.get(GuildSettings.Events.BanAdd) || message.guild!.settings.get(GuildSettings.Events.BanRemove)
			? { unlock: message.guild!.moderation.createLock() }
			: null;
	}

	public async handle(message: KlasaMessage, user: User, member: SkyraGuildMember, reason: string) {
		if (member && !member.bannable) throw message.language.get('COMMAND_BAN_NOT_BANNABLE');
		return softban(message.guild!, message.author!, user, reason, 'days' in message.flags ? Math.min(7, Math.max(0, Number(message.flags.days))) : 1);
	}

	public posthandle(_: KlasaMessage, __: User[], ___: string, prehandled: Unlock) {
		if (prehandled) prehandled.unlock();
	}

}

interface Unlock {
	unlock(): void;
}
