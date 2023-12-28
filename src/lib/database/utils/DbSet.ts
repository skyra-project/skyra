import { connect } from '#lib/database/database.config';
import { ClientEntity } from '#lib/database/entities/ClientEntity';
import { GuildEntity } from '#lib/database/entities/GuildEntity';
import { GuildSubscriptionEntity } from '#lib/database/entities/GuildSubscriptionEntity';
import { ModerationEntity } from '#lib/database/entities/ModerationEntity';
import { ScheduleEntity } from '#lib/database/entities/ScheduleEntity';
import { TwitchSubscriptionEntity } from '#lib/database/entities/TwitchSubscriptionEntity';
import { UserEntity } from '#lib/database/entities/UserEntity';
import type { DataSource, FindManyOptions, FindOptions, Repository } from 'typeorm';

export class DbSet {
	public readonly connection: DataSource;
	public readonly clients: Repository<ClientEntity>;
	public readonly guilds: Repository<GuildEntity>;
	public readonly guildSubscriptions: Repository<GuildSubscriptionEntity>;
	public readonly moderations: Repository<ModerationEntity>;
	public readonly schedules: Repository<ScheduleEntity>;
	public readonly twitchSubscriptions: Repository<TwitchSubscriptionEntity>;
	public readonly users: Repository<UserEntity>;

	private constructor(connection: DataSource) {
		this.connection = connection;
		this.clients = this.connection.getRepository(ClientEntity);
		this.guilds = this.connection.getRepository(GuildEntity);
		this.guildSubscriptions = this.connection.getRepository(GuildSubscriptionEntity);
		this.moderations = this.connection.getRepository(ModerationEntity);
		this.schedules = this.connection.getRepository(ScheduleEntity);
		this.twitchSubscriptions = this.connection.getRepository(TwitchSubscriptionEntity);
		this.users = this.connection.getRepository(UserEntity);
	}

	public async fetchModerationDirectMessageEnabled(id: string) {
		const entry = await this.users.findOne({ where: { id }, select: ['moderationDM'] });
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
	public fetchModerationEntry(conditions?: FindOptions<ModerationEntity>): Promise<ModerationEntity>;
	public async fetchModerationEntry(optionsOrConditions?: FindOptions<ModerationEntity> | FindManyOptions<ModerationEntity>) {
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
	public fetchModerationEntries(conditions?: FindOptions<ModerationEntity>): Promise<ModerationEntity[]>;
	public async fetchModerationEntries(optionsOrConditions?: FindOptions<ModerationEntity> | FindManyOptions<ModerationEntity>) {
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
