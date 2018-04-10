const { Extendable } = require('klasa');
const { Permissions: { FLAGS } } = require('discord.js');
const OPTIONS = { time: 20000, max: 1 };
const REACTIONS = { YES: '🇾', NO: '🇳' };
const REG_ACCEPT = /^y|yes?|yeah?$/i;

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Message'],
			name: 'ask'
		});
	}

	async extend(content, options) {
		const message = await this.send(content, options);
		return !this.guild || this.channel.permissionsFor(this.guild.me).has(FLAGS.ADD_REACTIONS)
			? awaitReaction(this, message)
			: awaitMessage(this);
	}

};

async function awaitReaction(msg, message) {
	await message.react(REACTIONS.YES);
	await message.react(REACTIONS.NO);
	const reactions = await message.awaitReactions((__, user) => user === msg.author, OPTIONS);

	// Remove all reactions if the user has permissions to do so
	if (msg.guild && msg.channel.permissionsFor(msg.guild.me).has(FLAGS.MANAGE_MESSAGES)) {
		message.reactions.removeAll().catch(error => message.client.emit('wtf', error));
	}
	return reactions.size && reactions.firstKey() === REACTIONS.YES;
}

async function awaitMessage(msg) {
	const messages = await msg.channel.awaitMessages(mes => mes.author === msg.author, OPTIONS);
	return messages.size && REG_ACCEPT.test(messages.first().content);
}
