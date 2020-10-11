import { connect } from '@lib/database/database.config';
import { BannerEntity } from '@lib/database/entities/BannerEntity';
import { GiveawayEntity } from '@lib/database/entities/GiveawayEntity';
import { GuildEntity } from '@lib/database/entities/GuildEntity';
import { ModerationEntity } from '@lib/database/entities/ModerationEntity';
import { RpgBattleEntity } from '@lib/database/entities/RpgBattleEntity';
import { RpgClassEntity } from '@lib/database/entities/RpgClassEntity';
import { RpgGuildEntity } from '@lib/database/entities/RpgGuildEntity';
import { RpgGuildRankEntity } from '@lib/database/entities/RpgGuildRankEntity';
import { RpgItemEntity } from '@lib/database/entities/RpgItemEntity';
import { RpgUserEntity } from '@lib/database/entities/RpgUserEntity';
import { RpgUserItemEntity } from '@lib/database/entities/RpgUserItemEntity';
import { ScheduleEntity } from '@lib/database/entities/ScheduleEntity';
import { StarboardEntity } from '@lib/database/entities/StarboardEntity';
import { SuggestionEntity } from '@lib/database/entities/SuggestionEntity';
import { TwitchStreamSubscriptionEntity } from '@lib/database/entities/TwitchStreamSubscriptionEntity';
import { UserCooldownEntity } from '@lib/database/entities/UserCooldownEntity';
import { UserGameIntegrationEntity } from '@lib/database/entities/UserGameIntegrationEntity';
import { UserProfileEntity } from '@lib/database/entities/UserProfileEntity';
import { ClientRepository } from '@lib/database/repositories/ClientRepository';
import { MemberRepository } from '@lib/database/repositories/MemberRepository';
import { UserRepository } from '@lib/database/repositories/UserRepository';
import { BrandingColors } from '@utils/constants';
import type { Message } from 'discord.js';
import type { Connection, FindConditions, FindManyOptions } from 'typeorm';

export class DbSet {
	public connection: Connection;
	private constructor(connection: Connection) {
		this.connection = connection;
	}

	public get banners() {
		return this.connection.getRepository(BannerEntity);
	}

	public get clients() {
		return this.connection.getCustomRepository(ClientRepository);
	}

	public get giveaways() {
		return this.connection.getRepository(GiveawayEntity);
	}

	public get guilds() {
		return this.connection.getRepository(GuildEntity);
	}

	public get members() {
		return this.connection.getCustomRepository(MemberRepository);
	}

	public get moderations() {
		return this.connection.getRepository(ModerationEntity);
	}

	public get rpgBattles() {
		return this.connection.getRepository(RpgBattleEntity);
	}

	public get rpgClasses() {
		return this.connection.getRepository(RpgClassEntity);
	}

	public get rpgGuildRanks() {
		return this.connection.getRepository(RpgGuildRankEntity);
	}

	public get rpgGuilds() {
		return this.connection.getRepository(RpgGuildEntity);
	}

	public get rpgItems() {
		return this.connection.getRepository(RpgItemEntity);
	}

	public get rpgUserItems() {
		return this.connection.getRepository(RpgUserItemEntity);
	}

	public get rpgUsers() {
		return this.connection.getRepository(RpgUserEntity);
	}

	public get schedules() {
		return this.connection.getRepository(ScheduleEntity);
	}

	public get starboards() {
		return this.connection.getRepository(StarboardEntity);
	}

	public get suggestions() {
		return this.connection.getRepository(SuggestionEntity);
	}

	public get twitchStreamSubscriptions() {
		return this.connection.getRepository(TwitchStreamSubscriptionEntity);
	}

	public get users() {
		return this.connection.getCustomRepository(UserRepository);
	}

	public get userProfiles() {
		return this.connection.getRepository(UserProfileEntity);
	}

	public get userGameIntegrations() {
		return this.connection.getRepository(UserGameIntegrationEntity);
	}

	public get userCooldowns() {
		return this.connection.getRepository(UserCooldownEntity);
	}

	public static async connect() {
		return new DbSet(await connect());
	}

	public static async fetchModerationDirectMessageEnabled(id: string) {
		const { users } = await DbSet.connect();
		const entry = await users.findOne(id);
		return entry?.moderationDM ?? true;
	}

	/**
	 * Finds entities that match given options.
	 */
	public static fetchModerationEntry(options?: FindManyOptions<ModerationEntity>): Promise<ModerationEntity>;

	/**
	 * Finds entities that match given conditions.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public static fetchModerationEntry(conditions?: FindConditions<ModerationEntity>): Promise<ModerationEntity>;
	public static async fetchModerationEntry(optionsOrConditions?: FindConditions<ModerationEntity> | FindManyOptions<ModerationEntity>) {
		const { moderations } = await DbSet.connect();
		return moderations.findOne(optionsOrConditions as any);
	}

	/**
	 * Finds entities that match given options.
	 */
	public static fetchModerationEntries(options?: FindManyOptions<ModerationEntity>): Promise<ModerationEntity[]>;

	/**
	 * Finds entities that match given conditions.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public static fetchModerationEntries(conditions?: FindConditions<ModerationEntity>): Promise<ModerationEntity[]>;
	public static async fetchModerationEntries(optionsOrConditions?: FindConditions<ModerationEntity> | FindManyOptions<ModerationEntity>) {
		const { moderations } = await DbSet.connect();
		return moderations.find(optionsOrConditions as any);
	}

	public static async fetchColor(message: Message) {
		const { userProfiles } = await DbSet.connect();
		const user = await userProfiles.findOne(message.author.id);

		return user?.color || message.member?.displayColor || BrandingColors.Primary;
	}
}
