import { Task } from 'klasa';

export default class extends Task {

	public async run({ id }: { id: string }): Promise<void> {
		await this.client.providers.default.delete('polls', id);
	}

}
