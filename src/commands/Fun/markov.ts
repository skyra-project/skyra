import { CommandStore, KlasaMessage, Stopwatch } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Markov, WordBank } from '../../lib/util/External/markov';
import { cutText, getColor } from '../../lib/util/util';
import { MessageEmbed } from 'discord.js';
import { BrandingColors } from '../../lib/util/constants';

const kCodeA = 'A'.charCodeAt(0);
const kCodeZ = 'Z'.charCodeAt(0);

export default class extends SkyraCommand {

	private kMessageHundredsLimit = 10;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_MARKOV_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MARKOV_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS', 'READ_MESSAGE_HISTORY']
		});
	}

	public async run(message: KlasaMessage) {
		// Send loading message
		await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		// Process the chain
		const messageBank = await this.fetchMessages(message);
		const time = new Stopwatch();
		const contents = messageBank.map(m => m.content).join(' ');
		const chain = new Markov()
			.parse(contents)
			.start(this.useUpperCase.bind(this))
			.end(20)
			.process();
		time.stop();

		// Send the result message
		return message.sendMessage(new MessageEmbed()
			.setDescription(cutText(chain, 2000))
			.setColor(getColor(message))
			.setFooter(`Processed in ${time}`));
	}

	private async fetchMessages(message: KlasaMessage) {
		let messageBank = await message.channel.messages.fetch({ limit: 100 });
		for (let i = 1; i < this.kMessageHundredsLimit; ++i) {
			messageBank = messageBank.concat(await message.channel.messages.fetch({ limit: 100, before: messageBank.lastKey() }));
		}

		return messageBank;
	}

	private useUpperCase(wordBank: WordBank) {
		let code: number;
		const filtered: string[] = [];
		for (const key of wordBank.keys()) {
			code = key.charCodeAt(0);
			if (code >= kCodeA && code <= kCodeZ) filtered.push(key);
		}

		return filtered[Math.floor(Math.random() * filtered.length)];
	}

}
