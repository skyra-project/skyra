import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { PermissionLevels } from '../../lib/types/Enums';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['nickname'],
			cooldown: 30,
			description: language => language.tget('COMMAND_NICK_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_NICK_EXTENDED'),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['CHANGE_NICKNAME'],
			runIn: ['text'],
			usage: '[nick:string{,32}]'
		});
	}

	public async run(message: KlasaMessage, [nick = '']: [string?]) {
		await message.guild!.me!.setNickname(nick);
		return nick
			? message.alert(message.language.tget('COMMAND_NICK_SET', nick))
			: message.alert(message.language.tget('COMMAND_NICK_CLEARED'));
	}

}
