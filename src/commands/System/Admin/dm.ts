import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { MessageOptions, User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get('COMMAND_DM_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DM_EXTENDED'),
			guarded: true,
			permissionLevel: PermissionLevels.BotOwner,
			usage: '<user:user> <message:...string>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [user, content]: [User, string]) {
		const attachment = message.attachments.size > 0 ? message.attachments.first()!.url : null;
		const options: MessageOptions = {};
		if (attachment) options.files = [{ attachment }];

		try {
			await user.send(content, options);
			return await message.alert(`Message successfully sent to ${user}`);
		} catch {
			return message.alert(`I am sorry, I could not send the message to ${user}`);
		}
	}
}
