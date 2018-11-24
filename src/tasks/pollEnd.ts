import { Task } from 'klasa';

export default class extends Task {

	public async run({ id }: { id: string }): Promise<void> {
		// TODO: Do something that's actually good, store polls in its table
		await this.client.providers.default.delete('polls', id);
	}

}
