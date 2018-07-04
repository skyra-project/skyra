const { Command, util: { fetch } } = require('../../../index');
const attachmentFilter = /\.(?:webp|png|jpg|gif)$/i;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: (msg) => msg.language.get('COMMAND_SETAVATAR_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETAVATAR_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '(attachment:attachment)'
		});

		this.createCustomResolver('attachment', async (arg, possible, msg) => {
			if (msg.attachments.size) {
				const file = msg.attachments.find(attachment => attachmentFilter.test(attachment.url));
				if (file) return fetch(file.url, 'buffer');
			}
			const url = (res => res && res.protocol && attachmentFilter.test(res.pathname) && res.hostname && res.href)(new URL(arg));
			if (url) return fetch(url, 'buffer');
			throw (msg ? msg.language : this.client.languages.default).get('RESOLVER_INVALID_URL', possible.name);
		});
	}

	async run(msg, [avatar]) {
		await this.client.user.setAvatar(avatar);
		return msg.sendMessage(`Dear ${msg.author}, I have changed my avatar for you.`);
	}

};
