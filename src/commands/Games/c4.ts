import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '#root/config';
import { ApplyOptions } from '@skyra/decorators';
import { User } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['connect-four'],
	cooldown: 0,
	description: LanguageKeys.Commands.Games.C4Description,
	extendedHelp: LanguageKeys.Commands.Games.C4Extended,
	requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	usage: '<user:username>'
})
export default class extends SkyraCommand {
	private prompt = this.definePrompt('<response:boolean>');

	public async run(message: GuildMessage, [user]: [User]) {
		const t = await message.fetchT();

		if (user.id === CLIENT_ID) throw t(LanguageKeys.Commands.Games.GamesSkyra);
		if (user.bot) throw t(LanguageKeys.Commands.Games.GamesBot);
		if (user.id === message.author.id) throw t(LanguageKeys.Commands.Games.GamesSelf);
		if (this.client.connectFour.has(message.channel.id)) throw t(LanguageKeys.Commands.Games.GamesProgress);
		this.client.connectFour.set(message.channel.id, null);

		try {
			const [response] = await this.prompt
				.createPrompt(message, { target: user })
				.run(t(LanguageKeys.Commands.Games.C4Prompt, { challenger: message.author.toString(), challengee: user.toString() }));
			if (response) {
				await this.client.connectFour.create(message, message.author, user)!.run();
			} else {
				await message.alert(t(LanguageKeys.Commands.Games.GamesPromptDeny));
			}
		} catch (error) {
			if (typeof error !== 'string') this.client.emit(Events.Wtf, error);
			await message.alert(t(LanguageKeys.Commands.Games.GamesPromptTimeout));
		} finally {
			this.client.connectFour.delete(message.channel.id);
		}
	}
}
