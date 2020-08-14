import { kBigIntTransformer } from '@utils/util';
import { BaseEntity, Check, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('member', { schema: 'public' })
@Check(/* sql */ `"points" >= 0`)
export class MemberEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19 })
	public guildID!: string;

	@PrimaryColumn('varchar', { length: 19 })
	public userID!: string;

	@Column('bigint', { default: 0, transformer: kBigIntTransformer })
	public points = 0;
}
