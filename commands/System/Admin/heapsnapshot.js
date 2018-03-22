const { Command } = require('../../../index');
const { promisify } = require('util');
const writeSnapshot = promisify(require('heapdump').writeSnapshot);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permLevel: 10,
			guarded: true,
			description: 'Creates a heapdump for finding memory leaks.'
		});
	}

	async run(msg) {
		if (msg.deletable) msg.nuke().catch(error => this.client.emit('wtf', error));
		const filename = await writeSnapshot(`./${Date.now()}.heapsnapshot`);
		return this.client.emit('log', `Created new heapdump : ${filename}`);
	}

};
