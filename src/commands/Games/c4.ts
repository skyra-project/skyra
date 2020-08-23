import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { CLIENT_ID } from '@root/config';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage, Usage } from 'klasa';

export default class extends SkyraCommand {
	private prompt: Usage;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['connect-four'],
			cooldown: 0,
			description: (language) => language.get('commandC4Description'),
			extendedHelp: (language) => language.get('commandC4Extended'),
			requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.prompt = this.definePrompt('<response:boolean>');
	}

	public async run(message: KlasaMessage, [user]: [User]) {
		if (user.id === CLIENT_ID) throw message.language.get('commandGamesSkyra');
		if (user.bot) throw message.language.get('commandGamesBot');
		if (user.id === message.author.id) throw message.language.get('commandGamesSelf');
		if (this.client.connectFour.has(message.channel.id)) throw message.language.get('commandGamesProgress');
		this.client.connectFour.set(message.channel.id, null);

		try {
			const [response] = await this.prompt
				.createPrompt(message, { target: user })
				.run(message.language.get('commandC4Prompt', { challenger: message.author.toString(), challengee: user.toString() }));
			if (response) {
				await this.client.connectFour.create(message, message.author, user)!.run();
			} else {
				await message.alert(message.language.get('commandGamesPromptDeny'));
			}
		} catch (error) {
			if (typeof error !== 'string') this.client.emit(Events.Wtf, error);
			await message.alert(message.language.get('commandGamesPromptTimeout'));
		} finally {
			this.client.connectFour.delete(message.channel.id);
		}
	}
}
