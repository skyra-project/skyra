import { BrandingColors } from '@utils/constants';
import type { Message } from 'discord.js';
import type { Connection, FindConditions, FindManyOptions } from 'typeorm';
import { connect } from '../database.config';
import { BannerEntity } from '../entities/BannerEntity';
import { GiveawayEntity } from '../entities/GiveawayEntity';
import { GuildEntity } from '../entities/GuildEntity';
import { ModerationEntity } from '../entities/ModerationEntity';
import { RpgBattleEntity } from '../entities/RpgBattleEntity';
import { RpgClassEntity } from '../entities/RpgClassEntity';
import { RpgGuildEntity } from '../entities/RpgGuildEntity';
import { RpgGuildRankEntity } from '../entities/RpgGuildRankEntity';
import { RpgItemEntity } from '../entities/RpgItemEntity';
import { RpgUserEntity } from '../entities/RpgUserEntity';
import { RpgUserItemEntity } from '../entities/RpgUserItemEntity';
import { ScheduleEntity } from '../entities/ScheduleEntity';
import { StarboardEntity } from '../entities/StarboardEntity';
import { SuggestionEntity } from '../entities/SuggestionEntity';
import { TwitchStreamSubscriptionEntity } from '../entities/TwitchStreamSubscriptionEntity';
import { UserCooldownEntity } from '../entities/UserCooldownEntity';
import { UserGameIntegrationEntity } from '../entities/UserGameIntegrationEntity';
import { UserProfileEntity } from '../entities/UserProfileEntity';
import { ClientRepository } from '../repositories/ClientRepository';
import { MemberRepository } from '../repositories/MemberRepository';
import { UserRepository } from '../repositories/UserRepository';

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
