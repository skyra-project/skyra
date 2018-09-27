const { Command } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			runIn: ['text'],
			cooldown: 0,
			aliases: [],
			permissionLevel: 10,
			requiredPermissions: [],
			requiredSettings: [],
			description: '',
			usage: '',
			usageDelim: undefined,
			extendedHelp: 'No extended help available.'
		});
	}

	// async run(msg, [...params]) {
	// 	// This is where you place the code you want to run for your command
	// }

}
