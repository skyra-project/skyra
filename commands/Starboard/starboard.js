const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			cooldown: 0,
			aliases: [],
			permLevel: 10,
			botPerms: [],
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

	async init() {
		const r = this.client.providers.default.db;
		const TABLENAME = 'starboard', INDEXNAME = 'guild_message';

		await r.branch(r.tableList().contains(TABLENAME), null,
			r.tableCreate(TABLENAME));
		await r.branch(r.table(TABLENAME).indexList().contains(INDEXNAME), null,
			r.table(TABLENAME).indexCreate(INDEXNAME, [r.row('guildID'), r.row('messageID')]));
		await r.branch(r.table(TABLENAME).indexStatus(INDEXNAME).nth(0)('ready'), null,
			r.table(TABLENAME).indexWait(INDEXNAME));
	}

};
