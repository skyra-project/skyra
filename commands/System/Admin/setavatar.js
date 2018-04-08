const { Command } = require('klasa');
const { get } = require('snekfetch');
const { parse } = require('url');
const attachmentFilter = /\.(?:webp|png|jpg|gif)$/i;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: (msg) => msg.language.get('COMMAND_SETAVATAR_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETAVATAR_EXTENDED'),
			guarded: true,
			permLevel: 10,
			usage: '(attachment:attachment)'
		});

		this.createCustomResolver('attachment', async (arg, possible, msg) => {
			if (msg.attachments.size) {
				const file = msg.attachments.find(attachment => attachmentFilter.test(attachment.url));
				if (file) return get(file.url).then(result => result.body);
			}
			const url = (res => res && res.protocol && res.hostname && res.href)(attachmentFilter.test(arg) && parse(arg));
			if (url) return get(url).then(result => result.body);
			throw (msg ? msg.language : this.client.languages.default).get('RESOLVER_INVALID_URL', possible.name);
		});
	}

	async run(msg, [avatar]) {
		await this.client.user.setAvatar(avatar);
		return msg.sendMessage(`Dear ${msg.author}, I have changed my avatar for you.`);
	}

};
