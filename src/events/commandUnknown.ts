const { Event, Stopwatch } = require('../index');

module.exports = class extends Event {

	public async run(msg, command) {
		if (!msg.guild || msg.guild.settings.disabledChannels.includes(msg.channel.id)) return;

		const tag = msg.guild.settings.tags.get(command);
		if (tag) msg.sendMessage(tag);
		else if (msg.guild.settings.trigger.alias.length) this.handleCommand(msg, command);
	}

	public get commandHandler() {
		return this.client.monitors.get('commandHandler');
	}

	public async handleCommand(msg, command) {
		const alias = ((entry) => entry
			? this.client.commands.get(entry.output)
			: undefined)(msg.guild.settings.trigger.alias.find((entry) => entry.input === command));
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
