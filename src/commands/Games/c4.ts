import { CommandStore, KlasaMessage, KlasaUser, Usage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Events } from '../../lib/types/Enums';

export default class extends SkyraCommand {

	private prompt: Usage;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['connect-four'],
			cooldown: 0,
			description: language => language.tget('COMMAND_C4_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_C4_EXTENDED'),
			requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.prompt = this.definePrompt('<response:boolean>');
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		if (user.id === this.client.user!.id) throw message.language.tget('COMMAND_GAMES_SKYRA');
		if (user.bot) throw message.language.tget('COMMAND_GAMES_BOT');
		if (user.id === message.author.id) throw message.language.tget('COMMAND_GAMES_SELF');
		if (this.client.connectFour.has(message.channel.id)) throw message.language.tget('COMMAND_GAMES_PROGRESS');
		this.client.connectFour.set(message.channel.id, null);

		try {
			const [response] = await this.prompt.createPrompt(message, { target: user }).run(message.language.tget('COMMAND_C4_PROMPT', message.author.toString(), user.toString()));
			if (response) {
				await this.client.connectFour.create(message, message.author, user)!.run();
			} else {
				await message.alert(message.language.tget('COMMAND_GAMES_PROMPT_DENY'));
			}
		} catch (error) {
			if (typeof error !== 'string') this.client.emit(Events.Wtf, error);
			await message.alert(message.language.tget('COMMAND_GAMES_PROMPT_TIMEOUT'));
		} finally {
			this.client.connectFour.delete(message.channel.id);
		}
	}

}
