const { Monitor } = require('../index');

module.exports = class extends Monitor {

	async run(msg) {
		const content = msg.content.toLowerCase();
		const trigger = msg.guild.settings.trigger.includes.find(trg => content.includes(trg.input));
		if (trigger && trigger.action === 'react') {
			if (msg.reactable) {
				await msg.react(trigger.output)
					.catch(error => { if (error.code !== 10008) this.client.emit('apiError', error); });
			}
		}
	}

	shouldRun(msg) {
		return this.enabled
			&& msg._edits.length === 0
			&& msg.guild
			&& msg.author.bot === false
			&& msg.author.id !== this.client.user.id
			&& msg.guild.settings.trigger.includes.length;
	}

};
