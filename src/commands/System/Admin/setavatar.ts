import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes, IMAGE_EXTENSION } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get(LanguageKeys.Commands.System.SetAvatarDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.System.SetAvatarExtended),
			guarded: true,
			permissionLevel: PermissionLevels.BotOwner,
			usage: '(attachment:attachment)'
		});

		this.createCustomResolver('attachment', (arg, possible, msg) => {
			if (msg.attachments.size) {
				const attachment = msg.attachments.find((att) => IMAGE_EXTENSION.test(att.url));
				if (attachment) return fetch(attachment.url, FetchResultTypes.Buffer);
			}
			const url = ((res) => res.protocol && IMAGE_EXTENSION.test(res.pathname) && res.hostname && res.href)(new URL(arg));
			if (url) return fetch(url, FetchResultTypes.Buffer);
			throw msg.language.get(LanguageKeys.Resolvers.InvalidUrl, { name: possible.name });
		});
	}

	public async run(message: KlasaMessage, [avatar]: [string]) {
		await this.client.user!.setAvatar(avatar);
		return message.sendMessage(`Dear ${message.author}, I have changed my avatar for you.`);
	}
}
