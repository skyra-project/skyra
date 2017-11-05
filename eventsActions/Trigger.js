module.exports = class Trigger {

	constructor(client) {
		this.client = client;
	}

	/**
     * @typedef  {Object} StringOperation
     * @property {string} input
     * @property {'react'|'reply'} action
     * @property {string} data
     */

	/**
     * @typedef  {Object} AliasObject
     * @property {string} input
     * @property {string} output
     * @memberof Trigger
     */

	/**
     * Execute the Trigger module.
     * @param {external:Message} msg The message.
     * @param {StringOperation[]} triggers The message triggers.
     * @returns {boolean}
     */
	runMonitors(msg, triggers) {
		if (triggers.length === 0) return false;
		for (let i = 0; i < triggers.length; i++) {
			if (msg.content.indexOf(triggers[i].input) !== -1) {
				switch (triggers[i].action) {
					case 'react':
						if (msg.channel.permissionsFor(this.client.user).has('ADD_REACTIONS'))
							msg.react(triggers[i].data).catch(() => null);
						return true;
					case 'reply':
						if (msg.channel.postable)
							msg.channel.send(triggers[i].data).catch(() => null);
						return true;
				}
			}
		}

		return false;
	}

	/**
	 * Parse aliases.
	 * @param {external:Message} msg The message.
	 * @param {string} command The name of the command/alias.
	 * @param {AliasObject[]} aliases The configured aliases.
	 * @returns {string}
	 */
	runAlias(msg, command, aliases) {
		if (aliases.length === 0) return command;
		const alias = aliases.find(entry => entry.input === command);
		if (!alias) return command;
		msg.content = msg.content.replace(command, alias.output);
		return alias.output.split(' ')[0];
	}

};
