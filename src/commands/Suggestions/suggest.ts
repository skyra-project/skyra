import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { WEBHOOK_FEEDBACK } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { BitFieldResolvable, MessageEmbed, PermissionString, TextChannel, Webhook } from 'discord.js';
import type { KlasaMessage } from 'klasa';

const requiredChannelPermissions = ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'VIEW_CHANNEL'] as BitFieldResolvable<PermissionString>;

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: (language) => language.get('COMMAND_SUGGEST_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_SUGGEST_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<suggestion:string>',
	flagSupport: true
})
export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private kChannelPrompt = this.definePrompt('<channel:textChannel>');

	public async run(message: KlasaMessage, [suggestion]: [string]) {
		// If including a flag of `--global` send suggestions to #feedbacks in Skyra Lounge
		const globalSuggestion = Reflect.has(message.flagArgs, 'global') && this.client.webhookFeedback;

		// ! NOTE: Once we start sharding we need to have a better solution for this
		const guild = globalSuggestion ? this.client.guilds.get(WEBHOOK_FEEDBACK!.guild_id!)! : message.guild!;
		let suggestionsChannel: Webhook | TextChannel | undefined = undefined;

		if (globalSuggestion) {
			suggestionsChannel = this.client.webhookFeedback!;
		} else {
			const suggestionsChannelID = guild.settings.get(GuildSettings.Suggestions.SuggestionsChannel)!;
			suggestionsChannel = this.client.channels.get(suggestionsChannelID) as TextChannel | undefined;
			if (!suggestionsChannel?.postable)
				throw message.language.get('COMMAND_SUGGEST_NOPERMISSIONS', {
					username: message.author.username,
					channel: (message.channel as TextChannel).toString()
				});
		}

		// Get the next suggestion ID
		const suggestionID = guild.settings.get(GuildSettings.Suggestions.AscendingID);

		// Post the suggestion
		const suggestionsMessage = await suggestionsChannel.send(
			new MessageEmbed()
				.setColor(BrandingColors.Primary)
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ format: 'png', size: 128, dynamic: true })
				)
				.setTitle(message.language.get('COMMAND_SUGGEST_TITLE', { id: suggestionID }))
				.setDescription(suggestion)
		);

		// Increase the next id
		await guild.settings.increase(GuildSettings.Suggestions.AscendingID, 1);

		// Add the upvote/downvote reactions
		const reactArray = [
			guild.settings.get(GuildSettings.Suggestions.VotingEmojis.UpvoteEmoji),
			guild.settings.get(GuildSettings.Suggestions.VotingEmojis.DownvoteEmoji)
		];
		for (const emoji of reactArray) {
			await suggestionsMessage.react(emoji);
		}

		// Commit the suggestion to the DB
		const { suggestions } = await DbSet.connect();
		await suggestions.insert({
			id: suggestionID,
			authorID: message.author.id,
			guildID: guild.id,
			messageID: suggestionsMessage.id
		});

		return message.sendLocale('COMMAND_SUGGEST_SUCCESS', [{ channel: global ? 'the feedback channel' : suggestionsChannel.toString() }]);
	}

	public async inhibit(message: KlasaMessage): Promise<boolean> {
		// If the message that triggered this is not this command (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null || Reflect.has(message.flagArgs, 'global')) return false;
		const suggestionID = message.guild.settings.get(GuildSettings.Suggestions.SuggestionsChannel);
		if (suggestionID === null) return this.setChannel(message);
		return false;
	}

	private async setChannel(message: KlasaMessage) {
		// If the user doesn't have the rights to change guild configuration, do not proceed
		const manageable = await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator);
		if (!manageable) {
			await message.sendLocale('COMMAND_SUGGEST_NOSETUP', [{ username: message.author.username }]);
			return true;
		}

		// Ask the user if they want to setup a channel
		const setup = await message.ask({ content: message.language.get('COMMAND_SUGGEST_NOSETUP_ASK', { username: message.author.username }) });
		if (!setup) {
			await message.sendLocale('COMMAND_SUGGEST_NOSETUP_ABORT');
			return true;
		}

		// Get the channel
		const [channel] = await this.kChannelPrompt
			.createPrompt(message, {
				target: message.author,
				limit: 1,
				time: 30000
			})
			.run<TextChannel[]>(message.language.get('COMMAND_SUGGEST_CHANNEL_PROMPT'));

		if (!channel || channel.guild.id !== message.guild!.id) {
			await message.sendLocale('RESOLVER_INVALID_CHANNELNAME');
			return true;
		}

		const missingPermissions = await this.missingBotPermissions(message);

		if (missingPermissions.length) {
			const permissions = message.language.PERMISSIONS;
			throw message.language.get('INHIBITOR_MISSING_BOT_PERMS', { missing: missingPermissions.map((permission) => permissions[permission]) });
		}

		// Update settings
		await message.guild!.settings.update(GuildSettings.Suggestions.SuggestionsChannel, channel);
		await message.sendLocale('COMMAND_CONF_MENU_SAVED');

		return true;
	}

	private async missingBotPermissions(message: KlasaMessage) {
		const textChannel = message.channel as TextChannel;
		const permissions = textChannel.permissionsFor(message.guild!.me!);
		if (!permissions) throw 'Failed to fetch permissions.';
		const missing = permissions.missing(requiredChannelPermissions, false);

		return missing;
	}
}
