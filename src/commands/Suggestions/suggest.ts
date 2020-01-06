import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { PermissionLevels } from '../../lib/types/Enums';
import { MessageEmbed, TextChannel } from 'discord.js';
import { BrandingColors } from '../../lib/util/constants';
import { displayEmoji } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_SUGGEST_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SUGGEST_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<suggestion:string{3,2000}>'
		});
	}

	public async run(message: KlasaMessage, [suggestion]: [string]) {
		let suggestionsChannelID: string | TextChannel | null = message.guild!.settings.get(GuildSettings.Suggestions.SuggestionsChannel);

		// Review(kyranet)
		// If we don't have a suggestions channel setup, initiate setting it up
		if (!suggestionsChannelID) {
			const userResponse = await this.setChannel(message);
			if (!userResponse) return;
			suggestionsChannelID = userResponse;
		}

		const suggestionsChannel = this.client.channels.get(suggestionsChannelID) as TextChannel;
		// Get the next suggestion ID
		const suggestionID = message.guild!.settings.get(GuildSettings.Suggestions.AscendingID);

		// Post the suggestion
		const suggestionsMessage = await suggestionsChannel!.send(new MessageEmbed()
			.setColor(BrandingColors.Primary)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 })!)
			.setTitle(message.language.tget('COMMAND_SUGGEST_TITLE', suggestionID))
			.setDescription(suggestion));

		// Add the upvote/downvote reactions
		const reactArray = await message.guild!.settings.pluck(GuildSettings.Suggestions.VotingEmojis.UpvoteEmoji, GuildSettings.Suggestions.VotingEmojis.DownvoteEmoji) as string[];
		for (const emojiStr of reactArray) {
			const emoji = displayEmoji(emojiStr);
			await suggestionsMessage.react(emoji);
		}

		// Increase the next id
		await message.guild!.settings.increase(GuildSettings.Suggestions.AscendingID, 1);

		return message.sendLocale('COMMAND_SUGGEST_SUCCESS', [suggestionsChannel]);
	}

	private async setChannel(message: KlasaMessage) {
		const resMessage = await message.sendLocale('COMMAND_SUGGEST_NOSETUP', [message.author.username]);

		// If the user doesn't have the rights to change guild configuration, do not proceed
		const manageable = await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator);
		if (!manageable) return;

		// Ask the user if they want to setup a channel
		const setup = await message.ask({ content: message.language.tget('COMMAND_SUGGEST_NOSETUP_ASK', message.author.username) });
		if (!setup) {
			await resMessage.edit(message.language.tget('COMMAND_SUGGEST_NOSETUP_ABORT'));
			return;
		}

		// Get the channel
		const channel = (await message.prompt(message.language.tget('COMMAND_SUGGEST_CHANNEL_PROMPT'))).mentions.channels.first() || null;
		if (!channel || channel.guild.id !== message.guild!.id) {
			await resMessage.edit(message.language.tget('COMMAND_SUGGEST_CHANNEL_INVALID'));
			return;
		}

		// Update settings
		await message.guild!.settings.update(GuildSettings.Suggestions.SuggestionsChannel, channel);
		await resMessage.nuke();
		await message.sendLocale('COMMAND_CONF_MENU_SAVED');

		return channel.id;
	}

}
