import { CommandStore, KlasaMessage, Serializer } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { PermissionLevels } from '../../lib/types/Enums';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Emojis } from '../../lib/util/constants';

const IdRegex = /\d{16,18}/;
const enum SuggestionsColors {
	ACCEPTED = '4CB02C',
	CONSIDERED = 'CFA08D',
	DENIED = 'F90505'
}

const actions = {
	ACCEPT: (author: string) => `${author} accepted this suggestion:`,
	CONSIDER: (author: string) => `${author} cosnsidered this suggestion:`,
	DENY: (author: string) => `${author} denied this suggestion:`
};

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: 'stuff',
			extendedHelp: 'pls end my sufferring',
			requiredPermissions: [],
			usage: '<message:message> <accept|a|deny|d|consider|c> [comment:...string]',
			usageDelim: ' ',
			flagSupport: true
		});

		this.createCustomResolver('message', async (arg, _, message) => {
			const channelID = await message.guild!.settings.get(GuildSettings.Suggestions.SuggestionsChannel)!;
			if (!channelID) throw `You haven't setup a suggestions channel yet`;
			const suggestionChannel = await this.client.channels.fetch(channelID) as TextChannel;
			const suggestionMessage = await Serializer.regex.snowflake.test(arg) ? await suggestionChannel.messages.fetch(arg).catch(() => null) : undefined;
			if (!suggestionMessage) throw 'Invalid message';
			// Review(kyranet)
			// This feels like adequately checking. Please review if something is iffy
			if (suggestionMessage.author.id !== this.client.user!.id || suggestionMessage.embeds.length === 0) throw `This isn't a valid suggestion!`;
			return suggestionMessage;
		});
	}

	public async run(message: KlasaMessage, [suggestionMessage, action, comment]: [KlasaMessage, string, string | undefined]) {

		const [shouldDM, shouldHideAuthor, shouldRepostSuggestion] = message.guild!.settings.pluck(GuildSettings.Suggestions.OnAction.DM, GuildSettings.Suggestions.OnAction.HideAuthor, GuildSettings.Suggestions.OnAction.RepostMessage) as boolean[];
		const suggestion = suggestionMessage.embeds[0];

		let newEmbed: MessageEmbed | null = null;
		let messageContent = null;
		if (typeof comment === 'undefined') comment = 'No comment was provided.';

		const author = this.getAuthor(message, shouldHideAuthor);
		switch (action) {
			case 'a':
			case 'accept':
				messageContent = actions.ACCEPT(author);
				newEmbed = suggestion
					.setColor(SuggestionsColors.ACCEPTED)
					.addField(messageContent, comment);
				break;
			case 'c':
			case 'consider':
				messageContent = actions.CONSIDER(author);
				newEmbed = suggestion
					.setColor(SuggestionsColors.CONSIDERED)
					.addField(actions.CONSIDER(author), comment);
				break;
			case 'd':
			case 'deny':
				messageContent = actions.DENY(author);
				newEmbed = suggestion
					.setColor(SuggestionsColors.DENIED)
					.addField(actions.DENY(author), comment);
				break;
		}

		if (shouldDM) {
			const matches = IdRegex.exec(suggestion.author!.name!);
			const user = this.client.users.get(matches![0]);
			if (!user) return;
			try {
				await user!.send(`${messageContent} in ${message.guild!.name}`, { embed: newEmbed! });
			} catch {
				await message.send(`${Emojis.RedCross} Couldn't DM the user. Are his DMs closed?`);
			}
		}

		shouldRepostSuggestion
			? await suggestionMessage.channel.send(messageContent, { embed: newEmbed! })
			: await suggestionMessage.edit(newEmbed);

		return message.send(`Successfully resolved suggestion \`${suggestionMessage.id}\`!`);

	}

	private getAuthor(message: KlasaMessage, HideAuthor: boolean) {
		if ('show-author' in message.flagArgs) return message.author.tag;
		if ('hide-author' in message.flagArgs || HideAuthor) {
			return message.hasAtLeastPermissionLevel(PermissionLevels.Administrator)
				? `An administrator`
				: `A moderator`;
		}
		return message.author.tag;
	}

}
