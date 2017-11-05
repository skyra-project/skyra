const { structures: { Extendable } } = require('../index');

const awaitReaction = async (msg, message) => {
	await message.react('🇾');
	await message.react('🇳');
	const data = await message.awaitReactions(reaction => reaction.users.has(msg.author.id), { time: 20000, max: 1 });
	if (data.firstKey() === '🇾') return true;
	throw null;
};

const awaitMessage = async (msg) => {
	const messages = await msg.channel.awaitMessages(mes => mes.author === msg.author, { time: 20000, max: 1 });
	if (messages.size === 0) throw null;
	const message = await messages.first();
	if (message.content.toLowerCase() === 'yes') return true;
	throw null;
};

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Message']);
	}

	async extend(content, options) {
		const message = await this.send(content, options);
		if (this.channel.permissionsFor(this.guild.me).has('ADD_REACTIONS')) return awaitReaction(this, message);
		return awaitMessage(this);
	}

};
