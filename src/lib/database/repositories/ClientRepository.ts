/* eslint-disable @typescript-eslint/unified-signatures */
import { ClientEntity } from '@lib/database/entities/ClientEntity';
import { CLIENT_ID } from '@root/config';
import { EntityRepository, FindOneOptions, Repository } from 'typeorm';

@EntityRepository(ClientEntity)
export class ClientRepository extends Repository<ClientEntity> {
	public async ensure(options?: FindOneOptions<ClientEntity>) {
		return (await this.findOne(CLIENT_ID, options)) ?? new ClientEntity();
	}
}
