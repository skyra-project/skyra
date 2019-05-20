import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

const RESPONSE_OPTIONS = { time: 30000, errors: ['time'], max: 1 };

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['connect-four'],
			cooldown: 0,
			description: language => language.get('COMMAND_C4_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_C4_EXTENDED'),
			requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS'],
			runIn: ['text'],
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		if (user.id === this.client.user.id) throw message.language.get('COMMAND_GAMES_SKYRA');
		if (user.bot) throw message.language.get('COMMAND_GAMES_BOT');
		if (user.id === message.author.id) throw message.language.get('COMMAND_GAMES_SELF');
		if (this.client.connectFour.has(message.channel.id)) throw message.language.get('COMMAND_GAMES_PROGRESS');

		// ConnectFourManager#alloc returns a function that when getting true, it creates the game. Otherwise it de-alloc.
		const createGame = this.client.connectFour.alloc(message.channel.id, message.author, user);

		const prompt = await message.sendLocale('COMMAND_C4_PROMPT', [message.author, user]) as KlasaMessage;
		const response = await message.channel.awaitMessages(msg => msg.author.id === user.id && /^(ye(s|ah?)?|no)$/i.test(message.content), RESPONSE_OPTIONS)
			.then(messages => messages.first())
			.catch(() => null);

		if (response && /ye(s|ah?)?/i.test(response.content)) {
			await createGame(true).run(prompt);
		} else {
			createGame(false);
			await prompt.edit(message.language.get(response ? 'COMMAND_GAMES_PROMPT_DENY' : 'COMMAND_GAMES_PROMPT_TIMEOUT'));
			await prompt.nuke(10000);
		}

		this.client.connectFour.delete(message.channel.id);

		return null;
	}

}
