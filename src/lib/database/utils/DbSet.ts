import type { Connection, FindConditions, FindManyOptions, Repository } from 'typeorm';
import { connect } from '../database.config';
import { BannerEntity } from '../entities/BannerEntity';
import { GuildEntity } from '../entities/GuildEntity';
import { GuildSubscriptionEntity } from '../entities/GuildSubscriptionEntity';
import { ModerationEntity } from '../entities/ModerationEntity';
import { ScheduleEntity } from '../entities/ScheduleEntity';
import { TwitchSubscriptionEntity } from '../entities/TwitchSubscriptionEntity';
import { UserEntity } from '../entities/UserEntity';
import { ClientRepository } from '../repositories/ClientRepository';

export class DbSet {
	public readonly connection: Connection;
	public readonly banners: Repository<BannerEntity>;
	public readonly clients: ClientRepository;
	public readonly guilds: Repository<GuildEntity>;
	public readonly guildSubscriptions: Repository<GuildSubscriptionEntity>;
	public readonly moderations: Repository<ModerationEntity>;
	public readonly schedules: Repository<ScheduleEntity>;
	public readonly twitchSubscriptions: Repository<TwitchSubscriptionEntity>;
	public readonly users: Repository<UserEntity>;

	private constructor(connection: Connection) {
		this.connection = connection;
		this.banners = this.connection.getRepository(BannerEntity);
		this.clients = this.connection.getCustomRepository(ClientRepository);
		this.guilds = this.connection.getRepository(GuildEntity);
		this.guildSubscriptions = this.connection.getRepository(GuildSubscriptionEntity);
		this.moderations = this.connection.getRepository(ModerationEntity);
		this.schedules = this.connection.getRepository(ScheduleEntity);
		this.twitchSubscriptions = this.connection.getRepository(TwitchSubscriptionEntity);
		this.users = this.connection.getRepository(UserEntity);
	}

	public async fetchModerationDirectMessageEnabled(id: string) {
		const entry = await this.users.findOne(id, { select: ['moderationDM'] });
		return entry?.moderationDM ?? true;
	}

	/**
	 * Finds entities that match given options.
	 */
	public fetchModerationEntry(options?: FindManyOptions<ModerationEntity>): Promise<ModerationEntity>;

	/**
	 * Finds entities that match given conditions.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public fetchModerationEntry(conditions?: FindConditions<ModerationEntity>): Promise<ModerationEntity>;
	public async fetchModerationEntry(optionsOrConditions?: FindConditions<ModerationEntity> | FindManyOptions<ModerationEntity>) {
		return this.moderations.findOne(optionsOrConditions as any);
	}

	/**
	 * Finds entities that match given options.
	 */
	public fetchModerationEntries(options?: FindManyOptions<ModerationEntity>): Promise<ModerationEntity[]>;

	/**
	 * Finds entities that match given conditions.
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	public fetchModerationEntries(conditions?: FindConditions<ModerationEntity>): Promise<ModerationEntity[]>;
	public async fetchModerationEntries(optionsOrConditions?: FindConditions<ModerationEntity> | FindManyOptions<ModerationEntity>) {
		return this.moderations.find(optionsOrConditions as any);
	}

	public static instance: DbSet | null = null;
	private static connectPromise: Promise<DbSet> | null;

	public static async connect() {
		return (DbSet.instance ??= await (DbSet.connectPromise ??= connect().then((connection) => {
			DbSet.connectPromise = null;
			return new DbSet(connection);
		})));
	}
}
