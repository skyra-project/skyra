import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { fetch } from '../../../lib/util/util';

const attachmentFilter = /\.(?:webp|png|jpg|gif)$/i;

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_SETAVATAR_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETAVATAR_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '(attachment:attachment)'
		});

		this.createCustomResolver('attachment', async(arg, possible, msg) => {
			if (msg.attachments.size) {
				const attachment = msg.attachments.find((att) => attachmentFilter.test(att.url));
				if (attachment) return fetch(attachment.url, 'buffer');
			}
			const url = ((res) => res && res.protocol && attachmentFilter.test(res.pathname) && res.hostname && res.href)(new URL(arg));
			if (url) return fetch(url, 'buffer');
			throw (msg ? msg.language : this.client.languages.default).get('RESOLVER_INVALID_URL', possible.name);
		});
	}

	public async run(message: KlasaMessage, [avatar]: [string]) {
		await this.client.user.setAvatar(avatar);
		return message.sendMessage(`Dear ${message.author}, I have changed my avatar for you.`);
	}

}
