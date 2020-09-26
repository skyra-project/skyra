import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { WEBHOOK_FEEDBACK } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { BitFieldResolvable, MessageEmbed, PermissionString, TextChannel, Webhook } from 'discord.js';
import type { KlasaMessage } from 'klasa';

const requiredChannelPermissions = ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'VIEW_CHANNEL'] as BitFieldResolvable<PermissionString>;

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Suggestions.SuggestDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Suggestions.SuggestExtended),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<suggestion:string>',
	flagSupport: true
})
export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private kChannelPrompt = this.definePrompt('<channel:textChannel|here>');

	public async run(message: KlasaMessage, [suggestion]: [string]) {
		// If including a flag of `--global` send suggestions to #feedbacks in Skyra Lounge
		const globalSuggestion = Reflect.has(message.flagArgs, 'global') && this.client.webhookFeedback;

		// ! NOTE: Once we start sharding we need to have a better solution for this
		const guild = globalSuggestion ? this.client.guilds.cache.get(WEBHOOK_FEEDBACK!.guild_id!)! : message.guild!;
		let suggestionsChannel: Webhook | TextChannel | undefined = undefined;

		if (globalSuggestion) {
			suggestionsChannel = this.client.webhookFeedback!;
		} else {
			const suggestionsChannelID = guild.settings.get(GuildSettings.Suggestions.SuggestionsChannel)!;
			suggestionsChannel = this.client.channels.cache.get(suggestionsChannelID) as TextChannel | undefined;
			if (!suggestionsChannel?.postable)
				throw message.language.get(LanguageKeys.Commands.Suggestions.SuggestNopermissions, {
					username: message.author.username,
					channel: (message.channel as TextChannel).toString()
				});
		}

		// Get the next suggestion ID
		const suggestionID = guild.settings.get(GuildSettings.Suggestions.AscendingID);

		// Post the suggestion
		// TODO: This seems to be a bug in discord.js's types
		const suggestionsMessage = await (suggestionsChannel as TextChannel).send(
			new MessageEmbed()
				.setColor(BrandingColors.Primary)
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ format: 'png', size: 128, dynamic: true })
				)
				.setTitle(message.language.get(LanguageKeys.Commands.Suggestions.SuggestTitle, { id: suggestionID }))
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

		return message.sendLocale(LanguageKeys.Commands.Suggestions.SuggestSuccess, [
			{ channel: global ? 'the feedback channel' : suggestionsChannel.toString() }
		]);
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
			await message.sendLocale(LanguageKeys.Commands.Suggestions.SuggestNoSetup, [{ username: message.author.username }]);
			return true;
		}

		// Ask the user if they want to setup a channel
		const setup = await message.ask({
			content: message.language.get(LanguageKeys.Commands.Suggestions.SuggestNoSetupAsk, { username: message.author.username })
		});
		if (!setup) {
			await message.sendLocale(LanguageKeys.Commands.Suggestions.SuggestNoSetupAbort);
			return true;
		}

		// Get the channel
		let [channel] = await this.kChannelPrompt
			.createPrompt(message, {
				target: message.author,
				limit: 1,
				time: 30000
			})
			.run<TextChannel[] | string[]>(message.language.get(LanguageKeys.Commands.Suggestions.SuggestChannelPrompt));

		channel = (typeof channel === 'string' ? message.channel : channel) as TextChannel;

		if (!channel || channel.guild.id !== message.guild!.id) {
			await message.sendLocale(LanguageKeys.Resolvers.InvalidChannelName, [{ name: channel.name }]);
			return true;
		}

		const missingPermissions = await this.missingBotPermissions(message);

		if (missingPermissions.length) {
			const permissions = message.language.PERMISSIONS;
			throw message.language.get(LanguageKeys.Inhibitors.MissingBotPerms, {
				missing: message.language.list(
					missingPermissions.map((permission) => permissions[permission]),
					message.language.get(LanguageKeys.Globals.And)
				)
			});
		}

		// Update settings
		await message.guild!.settings.update(GuildSettings.Suggestions.SuggestionsChannel, channel);
		await message.sendLocale(LanguageKeys.Commands.Admin.ConfMenuSaved);

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
