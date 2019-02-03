import { User } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationTypeKeys } from '../../lib/util/constants';
import { softban } from '../../lib/util/util';

export default class extends ModerationCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_SOFTBAN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SOFTBAN_EXTENDED'),
			modType: ModerationTypeKeys.Softban,
			permissionLevel: 5,
			requiredMember: false,
			requiredPermissions: ['BAN_MEMBERS']
		});
	}

	public async prehandle(message: KlasaMessage) {
		return message.guild.settings.get('events.banAdd') || message.guild.settings.get('events.banRemove') ? { unlock: message.guild.moderation.createLock() } : null;
	}

	public async handle(message: KlasaMessage, user: User, member: SkyraGuildMember, reason: string) {
		if (member && !member.bannable) throw message.language.get('COMMAND_BAN_NOT_BANNABLE');
		return softban(message.guild, message.author, user, reason, 'days' in message.flags ? Math.min(7, Math.max(0, Number(message.flags.days))) : 1);
	}

	public async posthandle(_: KlasaMessage, __: User[], ___: string, prehandled: Unlock) {
		if (prehandled) prehandled.unlock();
	}

}

interface Unlock {
	unlock(): void;
}
