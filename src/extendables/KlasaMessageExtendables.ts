// @ts-nocheck
const { Extendable, KlasaMessage, Permissions: { FLAGS }, klasaUtil: { sleep } } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { appliesTo: [KlasaMessage] });
	}

	async prompt(text, time = 30000) {
		const message = await this.channel.send(text);
		const responses = await this.channel.awaitMessages(msg => msg.author === this.author, { time, max: 1 });
		message.nuke();
		if (responses.size === 0) throw this.language.get('MESSAGE_PROMPT_TIMEOUT');
		return responses.first();
	}

	async ask(content, options) {
		const message = await this.send(content, options);
		return !this.guild || this.channel.permissionsFor(this.guild.me).has(FLAGS.ADD_REACTIONS)
			? awaitReaction(this, message)
			: awaitMessage(this);
	}

	alert(content, options, timer) {
		if (!this.channel.postable) return Promise.resolve(null);
		if (typeof options === 'number' && typeof timer === 'undefined') {
			timer = options;
			options = undefined;
		}

		return this.sendMessage(content, options).then(msg => {
			msg.nuke(typeof timer === 'number' ? timer : 10000)
				.catch((error) => this.client.emit('error', error));
			return msg;
		});
	}

	nuke(time = 0) {
		if (time === 0) return nuke(this);

		const count = this.edits.length;
		return sleep(time)
			.then(() => !this.deleted && this.edits.length === count ? nuke(this) : this);
	}

};

const OPTIONS = { time: 20000, max: 1 };
const REACTIONS = { YES: '🇾', NO: '🇳' };
const REG_ACCEPT = /^y|yes?|yeah?$/i;

async function awaitReaction(msg, message) {
	await message.react(REACTIONS.YES);
	await message.react(REACTIONS.NO);
	const reactions = await message.awaitReactions((__, user) => user === msg.author, OPTIONS);

	// Remove all reactions if the user has permissions to do so
	if (msg.guild && msg.channel.permissionsFor(msg.guild.me).has(FLAGS.MANAGE_MESSAGES))
		message.reactions.removeAll().catch(error => message.client.emit('wtf', error));

	return reactions.size && reactions.firstKey() === REACTIONS.YES;
}

async function awaitMessage(msg) {
	const messages = await msg.channel.awaitMessages(mes => mes.author === msg.author, OPTIONS);
	return messages.size && REG_ACCEPT.test(messages.first().content);
}

async function nuke(msg) {
	try {
		return await msg.delete();
	} catch (error) {
		if (error.code === 10008) return msg;
		throw error;
	}
}
