import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('client', { schema: 'public' })
export class ClientEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19, default: process.env.CLIENT_ID })
	public id: string = process.env.CLIENT_ID;

	@Column('varchar', { array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public userBlocklist: string[] = [];

	@Column('varchar', { array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public userBoost: string[] = [];

	@Column('varchar', { array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public guildBlocklist: string[] = [];

	@Column('varchar', { array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public guildBoost: string[] = [];
}
