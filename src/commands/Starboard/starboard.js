const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
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

};
