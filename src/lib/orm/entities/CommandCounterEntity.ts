import { BaseEntity, Check, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('command_counter', { schema: 'public' })
@Check(/* sql */`"uses" >= 0`)
export class CommandCounterEntity extends BaseEntity {

	@PrimaryColumn('varchar', { length: 32 })
	public id!: string;

	@Column('integer', { 'default': 0 })
	public uses = 0;

	public setID(id: string) {
		this.id = id;
		return this;
	}

}
