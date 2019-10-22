import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { fetch, IMAGE_EXTENSION } from '../../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_SETAVATAR_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SETAVATAR_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '(attachment:attachment)'
		});

		this.createCustomResolver('attachment', async (arg, possible, msg) => {
			if (msg.attachments.size) {
				const attachment = msg.attachments.find(att => IMAGE_EXTENSION.test(att.url));
				if (attachment) return fetch(attachment.url, 'buffer');
			}
			const url = (res => res.protocol && IMAGE_EXTENSION.test(res.pathname) && res.hostname && res.href)(new URL(arg));
			if (url) return fetch(url, 'buffer');
			throw (msg ? msg.language : this.client.languages.default).get('RESOLVER_INVALID_URL', possible.name);
		});
	}

	public async run(message: KlasaMessage, [avatar]: [string]) {
		await this.client.user!.setAvatar(avatar);
		return message.sendMessage(`Dear ${message.author}, I have changed my avatar for you.`);
	}

}
