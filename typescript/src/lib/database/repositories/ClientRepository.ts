/* eslint-disable @typescript-eslint/unified-signatures */
import { ClientEntity } from '#lib/database/entities/ClientEntity';
import { EntityRepository, FindOneOptions, Repository } from 'typeorm';

@EntityRepository(ClientEntity)
export class ClientRepository extends Repository<ClientEntity> {
	public async ensure(options?: FindOneOptions<ClientEntity>) {
		return (await this.findOne(process.env.CLIENT_ID, options)) ?? new ClientEntity();
	}
}
