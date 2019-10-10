import { Finalizer, KlasaMessage, Command } from 'klasa';
import { Databases } from '../lib/types/constants/Constants';
import { RDatum } from 'rethinkdb-ts';

export default class extends Finalizer {

	public async run(_message: KlasaMessage, command: Command) {
		const r = this.client.providers.default.db;
		await r.table(Databases.CommandCounter)
			.insert({ id: command.name, uses: 1 }, {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				conflict: (_id: RDatum, oldDoc: RDatum, _newDoc: RDatum) => ({
					id: oldDoc('id'),
					uses: oldDoc('uses').add(1)
				})
			})
			.run();
	}

}
