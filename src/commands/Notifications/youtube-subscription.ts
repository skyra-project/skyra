import { envParseBoolean } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { hyperlink } from '@discordjs/builders';
import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { Args, CommandOptionsRunTypeEnum, Resolvers } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envParseBoolean('GRPC_NOTIFICATIONS_ENABLED'),
	aliases: ['y-subscription', 'y-sub', 'yt-sub'],
	description: LanguageKeys.Commands.Notifications.YouTubeSubscriptionDescription,
	detailedDescription: LanguageKeys.Commands.Notifications.YouTubeSubscriptionExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subCommands: [
		'set',
		'add',
		{ input: 'subscribe', output: 'add' },
		'remove',
		{ input: 'unsubscribe', output: 'remove' },
		'clear',
		{ input: 'list', default: true }
	]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const channelUrl = await args.pick(UserCommand.youtubeUrl);
		await this.container.grpc.youtube.subscribe({ guildId: message.guild.id, channelUrl });
		return send(message, args.t(LanguageKeys.Commands.Notifications.YouTubeSubscriptionAdd, { channelUrl }));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const channelUrl = await args.pick(UserCommand.youtubeUrl);
		await this.container.grpc.youtube.unsubscribe({ guildId: message.guild.id, channelUrl });
		return send(message, args.t(LanguageKeys.Commands.Notifications.YouTubeSubscriptionRemove, { channelUrl }));
	}

	public async clear(message: GuildMessage, args: SkyraCommand.Args) {
		await this.container.grpc.youtube.removeAllSubscriptions({ guildId: message.guild.id });
		return send(message, args.t(LanguageKeys.Commands.Notifications.YouTubeSubscriptionClear));
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	public async list(message: GuildMessage, args: SkyraCommand.Args) {
		const { infoList } = await this.container.grpc.youtube.getSubscriptions({ guildId: message.guild.id });
		if (infoList.length === 0) {
			this.error(LanguageKeys.Commands.Notifications.YouTubeSubscriptionListEmpty);
		}

		const entries = infoList.map((entry) => hyperlink(entry.channelName, entry.channelUrl));
		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Notifications.YouTubeSubscriptionListTitle, { count: entries.length }))
			.setDescription(args.t(LanguageKeys.Globals.AndListValue, { value: entries }))
			.setTimestamp();

		return send(message, { embeds: [embed] });
	}

	public async set(message: GuildMessage, args: SkyraCommand.Args) {
		const type = await args.pick(UserCommand.set);
		switch (type) {
			case YoutubeSubscriptionSetAction.UploadChannel:
				return this.setUploadChannel(message, args);
			case YoutubeSubscriptionSetAction.UploadMessage:
				return this.setUploadMessage(message, args);
			case YoutubeSubscriptionSetAction.LiveChannel:
				return this.setLiveChannel(message, args);
			case YoutubeSubscriptionSetAction.LiveMessage:
				return this.setLiveMessage(message, args);
			default:
				return this.setAction(message, args, type);
		}
	}

	private async setAction(message: GuildMessage, args: SkyraCommand.Args, type: YoutubeSubscriptionSetAction) {
		switch (await args.pick(UserCommand.setAction)) {
			case YoutubeSubscriptionSetActionType.Channel:
				return type === YoutubeSubscriptionSetAction.Upload ? this.setUploadChannel(message, args) : this.setLiveChannel(message, args);
			case YoutubeSubscriptionSetActionType.Message:
				return type === YoutubeSubscriptionSetAction.Upload ? this.setUploadMessage(message, args) : this.setLiveMessage(message, args);
		}
	}

	private async setUploadChannel(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textOrNewsChannelName');
		await this.container.grpc.youtube.setDiscordUploadChannel({ guildId: message.guild.id, channelId: channel.id });
		return send(message, args.t(LanguageKeys.Commands.Notifications.YouTubeSubscriptionUploadChannel, { channel }));
	}

	private async setUploadMessage(message: GuildMessage, args: SkyraCommand.Args) {
		const content = await args.rest('string');
		await this.container.grpc.youtube.setDiscordUploadMessage({ guildId: message.guild.id, content });
		return send(message, args.t(LanguageKeys.Commands.Notifications.YouTubeSubscriptionUploadMessage, { content }));
	}

	private async setLiveChannel(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textOrNewsChannelName');
		await this.container.grpc.youtube.setDiscordLiveChannel({ guildId: message.guild.id, channelId: channel.id });
		return send(message, args.t(LanguageKeys.Commands.Notifications.YouTubeSubscriptionLiveChannel, { channel }));
	}

	private async setLiveMessage(message: GuildMessage, args: SkyraCommand.Args) {
		const content = await args.rest('string');
		await this.container.grpc.youtube.setDiscordLiveMessage({ guildId: message.guild.id, content });
		return send(message, args.t(LanguageKeys.Commands.Notifications.YouTubeSubscriptionLiveMessage, { content }));
	}

	private static youtubeUrlPathname = /^\/(?:(?:(?:c|user)\/)?[\w]{2,32}|channel\/[a-zA-Z0-9]{24})$/;
	private static youtubeUrl = Args.make<string>((parameter, { argument }) => {
		const urlResult = Resolvers.resolveHyperlink(parameter);
		if (!urlResult.success) return Args.error({ parameter, argument, identifier: urlResult.error });

		const url = urlResult.value;
		if (url.host !== 'www.youtube.com') {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Notifications.YoutubeSubscriptionInvalidYouTubeUrlHost });
		}

		const path = url.pathname;
		if (!UserCommand.youtubeUrlPathname.test(path)) {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Notifications.YoutubeSubscriptionInvalidYouTubeUrlPath });
		}

		return Args.ok(`https://www.youtube.com${path}`);
	});

	private static set = Args.make<YoutubeSubscriptionSetAction>((parameter, { args, argument }) => {
		const index = args.t(LanguageKeys.Commands.Notifications.YoutubeSubscriptionSetKeys).indexOf(parameter.toLowerCase());
		if (index === -1) {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Notifications.YoutubeSubscriptionInvalidSetKey });
		}

		return Args.ok(index as YoutubeSubscriptionSetAction);
	});

	private static setAction = Args.make<YoutubeSubscriptionSetActionType>((parameter, { args, argument }) => {
		const index = args.t(LanguageKeys.Commands.Notifications.YoutubeSubscriptionSetActionKeys).indexOf(parameter.toLowerCase());
		if (index === -1) {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Notifications.YoutubeSubscriptionInvalidSetActionKey });
		}

		return Args.ok(index as YoutubeSubscriptionSetActionType);
	});
}

const enum YoutubeSubscriptionSetAction {
	Upload,
	UploadChannel,
	UploadMessage,
	Live,
	LiveChannel,
	LiveMessage
}

const enum YoutubeSubscriptionSetActionType {
	Channel,
	Message
}
