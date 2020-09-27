import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage, Usage } from 'klasa';

export default class extends SkyraCommand {
	private prompt: Usage;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['connect-four'],
			cooldown: 0,
			description: (language) => language.get(LanguageKeys.Commands.Games.C4Description),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Games.C4Extended),
			requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '<user:username>'
		});

		this.prompt = this.definePrompt('<response:boolean>');
	}

	public async run(message: KlasaMessage, [user]: [User]) {
		if (user.id === CLIENT_ID) throw message.language.get(LanguageKeys.Commands.Games.GamesSkyra);
		if (user.bot) throw message.language.get(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) throw message.language.get(LanguageKeys.Commands.Games.GamesSelf);
		if (this.client.connectFour.has(message.channel.id)) throw message.language.get(LanguageKeys.Commands.Games.GamesProgress);
		this.client.connectFour.set(message.channel.id, null);

		try {
			const [response] = await this.prompt
				.createPrompt(message, { target: user })
				.run(
					message.language.get(LanguageKeys.Commands.Games.C4Prompt, { challenger: message.author.toString(), challengee: user.toString() })
				);
			if (response) {
				await this.client.connectFour.create(message, message.author, user)!.run();
			} else {
				await message.alert(message.language.get(LanguageKeys.Commands.Games.GamesPromptDeny));
			}
		} catch (error) {
			if (typeof error !== 'string') this.client.emit(Events.Wtf, error);
			await message.alert(message.language.get(LanguageKeys.Commands.Games.GamesPromptTimeout));
		} finally {
			this.client.connectFour.delete(message.channel.id);
		}
	}
}
