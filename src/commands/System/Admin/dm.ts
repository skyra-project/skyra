const { Command } = require('klasa');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_DM_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DM_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<user:user> <message:string> [...]',
			usageDelim: ','
		});
	}

	public async run(msg, [user, ...content]) {
		const attachment = msg.attachments.size > 0 ? msg.attachments.first().url : null;
		const options = {};
		if (attachment) options.files = [{ attachment }];

		return user.send(content.join(', '), options)
			.then(() => msg.alert(`Message successfully sent to ${user}`))
			.catch(() => msg.alert(`I am sorry, I could not send the message to ${user}`));
	}

}
