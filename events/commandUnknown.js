const { Event, Stopwatch } = require('klasa');

module.exports = class extends Event {

	async run(msg, command) {
		if (!msg.guild) return;
		if (msg.guild.configs.tags.has(command)) this.handleTag(msg, command);
		else if (msg.guild.configs.trigger.alias.length) this.handleCommand(msg, command);
	}

	get commandTag() {
		return this.client.commands.get('tag');
	}

	get commandHandler() {
		return this.client.monitors.get('commandHandler');
	}

	async handleTag(msg, command) {
		return (cmd => cmd
			? cmd.run(msg, [command, undefined]).catch(error => this.client.emit('commandError', msg, cmd, [command, undefined], error))
			: undefined)(this.commandTag);
	}

	async handleCommand(msg, command) {
		const alias = (entry => entry
			? this.client.commands.get(entry.output)
			: undefined)(msg.guild.configs.trigger.alias.find(entry => entry.input === command));
		if (!alias) return;

		const { regex: prefix, length: prefixLength } = this.commandHandler.getPrefix(msg);

		const timer = new Stopwatch();
		msg._registerCommand({ command: alias, prefix, prefixLength });

		try {
			await this.client.inhibitors.run(msg, alias);
		} catch (response) {
			this.client.emit('commandInhibited', msg, alias, response);
			return;
		}

		this.commandHandler.runCommand(msg, timer);
	}

};
