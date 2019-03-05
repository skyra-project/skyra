import { Message, MessageExtendablesAskOptions, MessageOptions, Permissions, TextChannel } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient, KlasaMessage, util } from 'klasa';
import { Events } from '../lib/types/Enums';

export default class extends Extendable {

	public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [Message] });
	}

	public async prompt(content: string, time: number = 30000) {
		const self = this as unknown as Message;
		const message = await self.channel.send(content) as Message;
		const responses = await self.channel.awaitMessages((msg) => msg.author === self.author, { time, max: 1 });
		message.nuke().catch((error) => self.client.emit(Events.ApiError, error));
		if (responses.size === 0) throw self.language.get('MESSAGE_PROMPT_TIMEOUT');
		return responses.first();
	}

	public async ask(options: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
	public async ask(content: string | MessageOptions, options?: MessageOptions | MessageExtendablesAskOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean> {
		if (typeof content !== 'string') {
			options = content;
			content = null;
		}
		const self = this as unknown as Message;
		const message = await self.send(content, options as MessageOptions) as KlasaMessage;
		return !self.guild || (self.channel as TextChannel).permissionsFor(self.guild.me).has(Permissions.FLAGS.ADD_REACTIONS)
			? awaitReaction(self, message, promptOptions)
			: awaitMessage(self, promptOptions);
	}

	public alert(content: string, timer?: number);
	public alert(content: string, options?: MessageOptions, timer?: number);
	public alert(content: string, options?: number | MessageOptions, timer?: number) {
		const self = this as unknown as Message;
		if (!self.channel.postable) return Promise.resolve(null);
		if (typeof options === 'number' && typeof timer === 'undefined') {
			timer = options;
			options = undefined;
		}

		return self.sendMessage(content, options as MessageOptions).then((msg: KlasaMessage) => {
			msg.nuke(typeof timer === 'number' ? timer : 10000)
				.catch((error) => self.client.emit(Events.ApiError, error));
			return msg;
		});
	}

	public async nuke(time: number = 0) {
		const self = this as unknown as Message;
		if (time === 0) return nuke(self);

		const count = self.edits.length;
		await util.sleep(time);
		return !self.deleted && self.edits.length === count ? nuke(self) : self;
	}

}

const OPTIONS = { time: 30000, max: 1 };
const REACTIONS = { YES: '🇾', NO: '🇳' };
const REG_ACCEPT = /^y|yes?|yeah?$/i;

async function awaitReaction(message: Message, messageSent: Message, promptOptions: MessageExtendablesAskOptions = OPTIONS) {
	await messageSent.react(REACTIONS.YES);
	await messageSent.react(REACTIONS.NO);
	const reactions = await messageSent.awaitReactions((__, user) => user === message.author, promptOptions);

	// Remove all reactions if the user has permissions to do so
	if (message.guild && (message.channel as TextChannel).permissionsFor(message.guild.me).has(Permissions.FLAGS.MANAGE_MESSAGES))
		messageSent.reactions.removeAll().catch((error) => messageSent.client.emit(Events.ApiError, error));

	return reactions.size && reactions.firstKey() === REACTIONS.YES;
}

async function awaitMessage(message: Message, promptOptions: MessageExtendablesAskOptions = OPTIONS) {
	const messages = await message.channel.awaitMessages((mes) => mes.author === message.author, promptOptions);
	return messages.size && REG_ACCEPT.test(messages.first().content);
}

async function nuke(message: Message) {
	try {
		return await message.delete();
	} catch (error) {
		// Unknown Message
		if (error.code === 10008) return message;
		throw error;
	}
}
