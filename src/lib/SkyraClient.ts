import { GuildSettings, SettingsManager } from '#lib/database';
import { readSettings } from '#lib/database/settings/functions';
import { GuildMemberFetchQueue } from '#lib/discord/GuildMemberFetchQueue';
import { WorkerManager } from '#lib/moderation/workers/WorkerManager';
import { AnalyticsData, InviteStore, ScheduleManager } from '#lib/structures';
import type { LongLivingReactionCollector } from '#lib/util/LongLivingReactionCollector';
import { Twitch } from '#lib/util/Notifications/Twitch';
import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '#root/config';
import { isGuildMessage } from '#utils/common';
import { Enumerable } from '@sapphire/decorators';
import { SapphireClient, container } from '@sapphire/framework';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import { envParseBoolean } from '@skyra/env-utilities';
import { WebhookClient, type Message } from 'discord.js';

export class SkyraClient extends SapphireClient {
	@Enumerable(false)
	public override dev = process.env.NODE_ENV !== 'production';

	/**
	 * The Schedule manager
	 */
	@Enumerable(false)
	public override schedules: ScheduleManager;

	/**
	 * The webhook to use for the error event
	 */
	@Enumerable(false)
	public override webhookError: WebhookClient | null = WEBHOOK_ERROR ? new WebhookClient(WEBHOOK_ERROR) : null;

	/**
	 * The invite store
	 */
	@Enumerable(false)
	public override invites = new InviteStore();

	@Enumerable(false)
	public override readonly analytics: AnalyticsData | null;

	@Enumerable(false)
	public override readonly guildMemberFetchQueue = new GuildMemberFetchQueue();

	@Enumerable(false)
	public override llrCollectors = new Set<LongLivingReactionCollector>();

	@Enumerable(false)
	public override twitch = new Twitch();

	public constructor() {
		super(CLIENT_OPTIONS);

		// Workers
		container.workers = new WorkerManager();
		container.settings = new SettingsManager();

		// Analytics
		this.schedules = new ScheduleManager();
		container.schedule = this.schedules;

		this.analytics = envParseBoolean('INFLUX_ENABLED') ? new AnalyticsData() : null;
	}

	public override async login(token?: string) {
		await container.workers.start();
		const loginResponse = await super.login(token);
		await this.schedules.init();
		return loginResponse;
	}

	public override async destroy() {
		await container.workers.destroy();
		this.guildMemberFetchQueue.destroy();
		this.invites.destroy();
		this.schedules.destroy();
		return super.destroy();
	}

	/**
	 * Retrieves the prefix for the guild.
	 * @param message The message that gives context.
	 */
	public override fetchPrefix = (message: Message) => {
		if (isGuildMessage(message)) return readSettings(message.guild, GuildSettings.Prefix);
		return [process.env.CLIENT_PREFIX, ''] as readonly string[];
	};

	/**
	 * Retrieves the language key for the message.
	 * @param message The message that gives context.
	 */
	public fetchLanguage = (message: InternationalizationContext) => {
		return message.guild ? readSettings(message.guild, GuildSettings.Language) : 'en-US';
	};
}
