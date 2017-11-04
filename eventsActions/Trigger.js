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
     * @param {{ alias: AliasObject[], includes: StringOperation[] }} triggers The message triggers.
     * @returns {any}
     */
	run(msg, triggers) {
		// Start with aliases
		if (triggers.alias.length > 0) for (let i = 0; i < triggers.alias.length; i++)
			if (msg.content.indexOf(`${triggers.alias[i].input} `) === 0) {
				msg.content = msg.content.replace(triggers.alias[i].input, triggers.alias[i].output);
				return true;
			}

		if (triggers.includes.length > 0) for (let i = 0; i < triggers.includes.length; i++)
			if (msg.content.indexOf(triggers.includes[i].input) !== -1)
				switch (triggers.includes[i].action) {
					case 'react':
						if (msg.channel.permissionsFor(this.client.user).has('ADD_REACTIONS'))
							msg.react(triggers.includes[i].data).catch(() => null);
						return true;
					case 'reply':
						msg.channel.send(triggers.includes[i].data).catch(() => null);
						return true;
				}

		return false;
	}

};
