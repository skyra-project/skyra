import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['nickname'],
			cooldown: 30,
			description: (language) => language.get('commandNickDescription'),
			extendedHelp: (language) => language.get('commandNickExtended'),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['CHANGE_NICKNAME'],
			runIn: ['text'],
			usage: '[nick:string{,32}]'
		});
	}

	public async run(message: KlasaMessage, [nickname = '']: [string?]) {
		await message.guild!.me!.setNickname(nickname);
		return nickname
			? message.alert(message.language.get('commandNickSet', { nickname }))
			: message.alert(message.language.get('commandNickCleared'));
	}
}
