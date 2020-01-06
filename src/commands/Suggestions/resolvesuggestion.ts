import { CommandStore, KlasaMessage, Serializer } from 'klasa';
import { MessageEmbed, TextChannel } from 'discord.js';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

const IdRegex = /\d{16,18}/;

const enum SuggestionsColors {
	ACCEPTED = '4CB02C',
	CONSIDERED = 'CFA08D',
	DENIED = 'F90505'
}

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['resu', 'rs'],
			cooldown: 10,
			description: language => language.tget('COMMAND_RESOLVESUGGESTION_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_RESOLVESUGGESTION_EXTENDED'),
			flagSupport: true,
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<message:message> <accept|a|deny|d|consider|c> [comment:...string]',
			usageDelim: ' '
		});

		this.createCustomResolver('message', async (arg, _, message) => {
			// Get the suggestion's channel ID
			const channelID = await message.guild!.settings.get(GuildSettings.Suggestions.SuggestionsChannel)!;
			if (!channelID) throw message.language.tget('COMMAND_SUGGEST_NOSETUP', message.author.username);

			// Check if the message provided is a valid message in the suggestion's channel
			const suggestionChannel = await this.client.channels.fetch(channelID) as TextChannel;
			const suggestionMessage = await Serializer.regex.snowflake.test(arg) ? await suggestionChannel.messages.fetch(arg).catch(() => null) : undefined;
			if (!suggestionMessage) throw message.language.tget('RESOLVER_INVALID_MESSAGE', 'message');

			// Review(kyranet)
			// This feels like adequately checking. Please review if something is iffy
			if (suggestionMessage.author.id !== this.client.user!.id || suggestionMessage.embeds.length === 0) throw message.language.tget('COMMAND_RESOLVESUGGESTION_INVALID');
			return suggestionMessage;
		});
	}

	public async run(message: KlasaMessage, [suggestionMessage, action, comment]: [KlasaMessage, string, string | undefined]) {

		const [shouldDM, shouldHideAuthor, shouldRepostSuggestion] = message.guild!.settings.pluck(GuildSettings.Suggestions.OnAction.DM, GuildSettings.Suggestions.OnAction.HideAuthor, GuildSettings.Suggestions.OnAction.RepostMessage) as boolean[];
		const suggestion = suggestionMessage.embeds[0];

		let newEmbed: MessageEmbed | null = null;
		let messageContent = null;
		if (typeof comment === 'undefined') comment = message.language.tget('COMMAND_RESOLVESUGGESTION_DEFAULTCOMMENT');

		const author = this.getAuthor(message, shouldHideAuthor);
		const actions = message.language.tget('COMMAND_RESOLVESUGGESTION_ACTIONS');
		const DMActions = message.language.tget('COMMAND_RESOLVESUGGESTION_ACTIONS_DMS');

		switch (action) {
			case 'a':
			case 'accept':
				messageContent = DMActions.ACCEPT(author, message.guild!.name);
				newEmbed = suggestion
					.setColor(SuggestionsColors.ACCEPTED)
					.addField(actions.ACCEPT(author), comment);
				break;
			case 'c':
			case 'consider':
				messageContent = DMActions.CONSIDER(author, message.guild!.name);
				newEmbed = suggestion
					.setColor(SuggestionsColors.CONSIDERED)
					.addField(actions.CONSIDER(author), comment);
				break;
			case 'd':
			case 'deny':
				messageContent = DMActions.DENY(author, message.guild!.name);
				newEmbed = suggestion
					.setColor(SuggestionsColors.DENIED)
					.addField(actions.DENY(author), comment);
				break;
		}

		if (shouldDM) {
			// Get the user's ID from the suggestion's author field
			const matches = IdRegex.exec(suggestion.author!.name!);
			const user = this.client.users.get(matches![0]);
			if (!user) return;
			try {
				await user!.send(messageContent, { embed: newEmbed! });
			} catch {
				await message.channel.sendLocale('COMMAND_RESOLVESUGGESTION_DM_FAIL');
			}
		}

		shouldRepostSuggestion
			? await suggestionMessage.channel.send(messageContent, { embed: newEmbed! })
			: await suggestionMessage.edit(newEmbed);

		return message.sendLocale('COMMAND_RESOLVESUGGESTION_SUCCESS', [suggestionMessage.id]);

	}

	private getAuthor(message: KlasaMessage, HideAuthor: boolean) {
		if ('show-author' in message.flagArgs) return message.author.tag;
		if ('hide-author' in message.flagArgs || HideAuthor) {
			return message.hasAtLeastPermissionLevel(PermissionLevels.Administrator)
				? message.language.tget('COMMAND_RESOLVESUGGESTION_AUTHOR_ADMIN')
				: message.language.tget('COMMAND_RESOLVESUGGESTION_AUTHOR_MODERATOR');
		}
		return message.author.tag;
	}

}
