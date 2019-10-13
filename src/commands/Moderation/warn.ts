import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['warning'],
			description: language => language.tget('COMMAND_WARN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WARN_EXTENDED'),
			modType: ModerationTypeKeys.Warn,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, _: SkyraGuildMember, reason: string) {
		if (reason && message.guild!.settings.get(GuildSettings.Messages.Warnings)) {
			user.send(message.language.tget('COMMAND_WARN_DM', message.author!.tag, message.guild!.toString(), reason)).catch(() => null);
		}
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
