const { structures: { Monitor, CommandMessage }, util: { util: { regExpEsc } } } = require('../index');
const Trigger = require('../eventsActions/Trigger');
const friendly = new RegExp('^((?:Hey )?Skyra(?:,|!) +)', 'i');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args);
		this.triggers = new Trigger(this.client);
	}

	run(msg, settings, i18n) {
		if (msg.channel.type === 'text') {
			const permissions = msg.channel.permissionsFor(msg.guild.me);
			if (permissions && permissions.has('SEND_MESSAGES') === false) return;
			const shouldStop = this.triggers.runMonitors(msg, settings.trigger.includes);
			if (shouldStop) return;
		}

		const { command, prefix, prefixLength } = this.parseCommand(msg, settings);
		if (!command) return;
		const validCommand = this.client.commands.get(command);
		if (!validCommand) return;
		this.client.inhibitors.run(msg, validCommand, false, settings, i18n)
			.then(() => this.runCommand(this.makeProxy(msg, new CommandMessage(msg, validCommand, prefix, prefixLength)), settings, i18n))
			.catch((response) => { if (response) msg.reply(response); });
	}

	parseCommand(msg, settings) {
		const prefix = this.getPrefix(msg, settings);
		if (!prefix) return { command: false };
		const prefixLength = prefix.exec(msg.content)[0].length;
		const command = msg.content.slice(prefixLength).trim().split(' ')[0].toLowerCase();
		return {
			command: this.triggers.runAlias(msg, command, settings.trigger.alias),
			prefix,
			prefixLength
		};
	}

	prefixCheck(prefix, str) {
		for (let i = prefix.length - 1; i >= 0; i--)
			if (str[i] !== prefix[i]) return false;
		return true;
	}

	getPrefix(msg, settings) {
		const prefix = settings.master.prefix;
		if (this.prefixCheck(prefix, msg.content)) return new RegExp(`^${regExpEsc(prefix)}`);
		if (this.client.config.prefixMention.test(msg.content)) return this.client.config.prefixMention;
		if (friendly.test(msg.content)) return friendly;
		return false;
	}

	makeProxy(msg, cmdMsg) {
		return new Proxy(msg, {
			get: function handler(target, param) {
				return param in msg ? msg[param] : cmdMsg[param];
			}
		});
	}

	runCommand(msg, settings, i18n) {
		msg.validateArgs()
			.then((params) => msg.cmd.run(msg, params, settings, i18n)
				.then(mes => this.client.finalizers.run(msg, mes))
				.catch(error => this.handleError(msg, error))
			)
			.catch((error) => this.handleError(msg, error));
	}

	handleError(msg, error) {
		if (typeof error === 'string') return msg.send(`Dear ${msg.author}, ${error}`);
		return msg.error(error);
	}

	init() {
		this.ignoreSelf = this.client.user.bot;
	}

};
