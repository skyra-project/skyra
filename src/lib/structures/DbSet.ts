import { connect } from '@orm/dbConfig';
import { BannerEntity } from '@orm/entities/BannerEntity';
import { GiveawayEntity } from '@orm/entities/GiveawayEntity';
import { GuildEntity } from '@orm/entities/GuildEntity';
import { ModerationEntity } from '@orm/entities/ModerationEntity';
import { RpgBattleEntity } from '@orm/entities/RpgBattleEntity';
import { RpgClassEntity } from '@orm/entities/RpgClassEntity';
import { RpgGuildEntity } from '@orm/entities/RpgGuildEntity';
import { RpgGuildRankEntity } from '@orm/entities/RpgGuildRankEntity';
import { RpgItemEntity } from '@orm/entities/RpgItemEntity';
import { RpgUserEntity } from '@orm/entities/RpgUserEntity';
import { RpgUserItemEntity } from '@orm/entities/RpgUserItemEntity';
import { ScheduleEntity } from '@orm/entities/ScheduleEntity';
import { StarboardEntity } from '@orm/entities/StarboardEntity';
import { SuggestionEntity } from '@orm/entities/SuggestionEntity';
import { TwitchStreamSubscriptionEntity } from '@orm/entities/TwitchStreamSubscriptionEntity';
import { UserCooldownEntity } from '@orm/entities/UserCooldownEntity';
import { UserProfileEntity } from '@orm/entities/UserProfileEntity';
import { ClientRepository } from '@orm/repositories/ClientRepository';
import { MemberRepository } from '@orm/repositories/MemberRepository';
import { UserRepository } from '@orm/repositories/UserRepository';
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
