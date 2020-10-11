/* eslint-disable @typescript-eslint/unified-signatures */
import { MemberEntity } from '@lib/database/entities/MemberEntity';
import { EntityRepository, FindOneOptions, Repository } from 'typeorm';

@EntityRepository(MemberEntity)
export class MemberRepository extends Repository<MemberEntity> {
	public async ensure(userID: string, guildID: string, options: FindOneOptions<MemberEntity> = {}) {
		const previous = await this.findOne({ where: { userID, guildID }, ...options });
		if (previous) return previous;

		const data = new MemberEntity();
		data.userID = userID;
		data.guildID = guildID;
		return data;
	}
}
