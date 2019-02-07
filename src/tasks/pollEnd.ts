import { Task } from 'klasa';
import { Databases } from '../lib/types/constants/Constants';

export default class extends Task {

	public async run({ id }: { id: string }): Promise<void> {
		await this.client.providers.default.delete(Databases.Polls, id);
	}

}
