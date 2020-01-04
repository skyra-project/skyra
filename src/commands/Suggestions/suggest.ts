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
			description: 'hehehe',
			extendedHelp: 'despacito',
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<suggestion:string{3,2000}>'
		});
	}

	public async run(message: KlasaMessage, [suggestion]: [string]) {
		let suggestionsChannel: string | TextChannel | null = message.guild!.settings.get(GuildSettings.Suggestions.SuggestionsChannel);

		// Review(kyranet)
		// If we don't have a suggestions channel setup, initiate setting it up
		if (!suggestionsChannel) {
			const resMessage = await message.send(`I'm sorry ${message.author.username}, but a suggestons channel hasn't been setup.`);

			// If the user doesn't have the rights to change guild configuration, do not proceed
			const manageable = await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator);
			if (!manageable) return;

			// Ask the user if they want to setup a channel
			const setup = await message.ask({ content: `I'm sorry ${message.author.username}, but a suggestons channel hasn't been setup. Would you like to set-up a channel now?` });
			if (!setup) {
				return resMessage.edit('Alright then. Aborted creating a new suggestion.');
			}

			// Get the channel
			suggestionsChannel = (await message.prompt('Please mention the channel you want to set as the suggestions channel. You have 30 seconds')).mentions.channels.first() || null;
			if (!suggestionsChannel) {
				return resMessage.edit('Didn\'t receive a valid channel mention. Aborting...');
			}

			// Update settings
			await message.guild!.settings.update(GuildSettings.Suggestions.SuggestionsChannel, suggestionsChannel);
			await resMessage.nuke();
			await message.send('Saved your selection.');
		}

		// If the channel did exist in the settings system, we need to fetch it
		if (typeof suggestionsChannel === 'string') suggestionsChannel = await this.client.channels.fetch(suggestionsChannel) as TextChannel;

		// Get the next suggestion ID
		const suggestionID = message.guild!.settings.get(GuildSettings.Suggestions.AscendingID);

		// Post the suggestion
		const suggestionsMessage = await suggestionsChannel.send(new MessageEmbed()
			.setColor(BrandingColors.Primary)
			.setAuthor(message.author.tag, message.author.avatarURL()!)
			.setTitle(`Suggestion #${suggestionID}`)
			.setDescription(suggestion));

		// Add the upvote/downvote reactions
		const reactArray = await message.guild?.settings.pluck(GuildSettings.Suggestions.VotingEmojis.UpvoteEmoji, GuildSettings.Suggestions.VotingEmojis.DownvoteEmoji) as string[];
		for (const emojiStr of reactArray) {
			const emoji = displayEmoji(emojiStr);
			await suggestionsMessage.react(emoji);
		}

		// Increase the next id
		await message.guild!.settings.increase(GuildSettings.Suggestions.AscendingID, 1);
	}

}
