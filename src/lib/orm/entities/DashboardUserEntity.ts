import { AfterLoad, BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('dashboard_user', { schema: 'public' })
export class DashboardUserEntity extends BaseEntity {

	@PrimaryColumn('varchar', { length: 19 })
	public id?: string;

	@Column('character', { 'length': 30, 'nullable': true, 'default': null })
	public accessToken: string | null = null;

	@Column('character', { 'length': 30, 'nullable': true, 'default': null })
	public refreshToken: string | null = null;

	@Column('timestamp without time zone', { 'name': 'expires_at', 'nullable': true, 'default': null })
	public expiresAt: Date | null = null;

	@AfterLoad()
	public afterLoad() {
		if (!this.expiresAt || this.expiresAt.getTime() >= Date.now()) {
			this.accessToken = null;
			this.refreshToken = null;
			this.expiresAt = null;
		}
	}

}
