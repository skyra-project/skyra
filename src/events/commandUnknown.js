const { Event, Stopwatch } = require('../index');

module.exports = class extends Event {

	async run(msg, command) {
		if (!msg.guild) return;
		if (msg.guild.settings.tags.has(command)) this.handleTag(msg, command);
		else if (msg.guild.settings.trigger.alias.length) this.handleCommand(msg, command);
	}

	get commandHandler() {
		return this.client.monitors.get('commandHandler');
	}

	handleTag(msg, command) {
		return msg.sendMessage(msg.guild.settings.tags.get(command));
	}

	async handleCommand(msg, command) {
		const alias = (entry => entry
			? this.client.commands.get(entry.output)
			: undefined)(msg.guild.settings.trigger.alias.find(entry => entry.input === command));
		if (!alias) return;

		// @ts-ignore
		const { regex: prefix, length: prefixLength } = this.commandHandler.getPrefix(msg);

		const timer = new Stopwatch();
		msg._registerCommand({ command: alias, prefix, prefixLength });

		try {
			await this.client.inhibitors.run(msg, alias, false);
		} catch (response) {
			this.client.emit('commandInhibited', msg, alias, response);
			return;
		}

		// @ts-ignore
		this.commandHandler.runCommand(msg, timer);
	}

};
