const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_DM_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DM_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<user:user> <message:string> [...]',
			usageDelim: ','
		});
	}

	async run(msg, [user, ...content]) {
		const attachment = msg.attachments.size > 0 ? msg.attachments.first().url : null;
		const options = {};
		if (attachment) options.files = [{ attachment }];

		return user.send(content.join(', '), options)
			.then(() => msg.alert(`Message successfully sent to ${user}`))
			.catch(() => msg.alert(`I am sorry, I could not send the message to ${user}`));
	}

};
