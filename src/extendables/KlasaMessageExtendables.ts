import { Message, MessageOptions, TextChannel } from 'discord.js';
import { Client, ExtendableStore } from 'klasa';

export default class extends Extendable {

	public constructor(client: Client, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [Message] });
	}

	public async prompt(content: string, time: number = 30000): Promise<Message> {
		const self = this as Message;
		const message = await self.channel.send(content);
		const responses = await self.channel.awaitMessages((msg) => msg.author === self.author, { time, max: 1 });
		message.nuke();
		if (responses.size === 0) throw self.language.get('MESSAGE_PROMPT_TIMEOUT');
		return responses.first();
	}

	public async ask(options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
	public async ask(content: string | MessageOptions, options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean> {
		const self = this as Message;
		const message = await self.send(content, options);
		return !self.guild || self.channel.permissionsFor(self.guild.me).has(FLAGS.ADD_REACTIONS)
			? awaitReaction(self, message, promptOptions)
			: awaitMessage(self, promptOptions);
	}

	public alert(content: string, timer?: number): Promise<Message>;
	public alert(content: string, options?: MessageOptions, timer?: number): Promise<Message>;
	public alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message> {
		const self = this as Message;
		if (!self.channel.postable) return Promise.resolve(null);
		if (typeof options === 'number' && typeof timer === 'undefined') {
			timer = options;
			options = undefined;
		}

		return self.sendMessage(content, options).then((msg) => {
			msg.nuke(typeof timer === 'number' ? timer : 10000)
				.catch((error) => self.client.emit('error', error));
			return msg;
		});
	}

	public nuke(time: number = 0): Promise<Message> {
		const self = this as Message;
		if (time === 0) return nuke(self);

		const count = self.edits.length;
		return sleep(time)
			.then(() => !self.deleted && self.edits.length === count ? nuke(self) : self);
	}

}

const OPTIONS = { time: 30000, max: 1 };
const REACTIONS = { YES: '🇾', NO: '🇳' };
const REG_ACCEPT = /^y|yes?|yeah?$/i;

async function awaitReaction(message: Message, messageSent: Message, promptOptions: MessageExtendablesAskOptions = OPTIONS): Promise<boolean> {
	await messageSent.react(REACTIONS.YES);
	await messageSent.react(REACTIONS.NO);
	const reactions = await messageSent.awaitReactions((__, user) => user === message.author, promptOptions);

	// Remove all reactions if the user has permissions to do so
	if (message.guild && (message.channel as TextChannel).permissionsFor(message.guild.me).has(FLAGS.MANAGE_MESSAGES))
		messageSent.reactions.removeAll().catch((error) => messageSent.client.emit('wtf', error));

	return reactions.size && reactions.firstKey() === REACTIONS.YES;
}

async function awaitMessage(message: Message, promptOptions: MessageExtendablesAskOptions = OPTIONS): Promise<boolean> {
	const messages = await message.channel.awaitMessages((mes) => mes.author === message.author, promptOptions);
	return messages.size && REG_ACCEPT.test(messages.first().content);
}

async function nuke(message: Message): Promise<Message> {
	try {
		return await message.delete();
	} catch (error) {
		if (error.code === 10008) return message;
		throw error;
	}
}
