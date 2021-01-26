import { Store } from '@sapphire/framework';
import { SubCommandEntry } from './SubCommandEntry';

export class SubCommandEntryCommand extends SubCommandEntry {
	public run(context: SubCommandEntry.RunContext): unknown {
		const command = Store.injectedContext.stores.get('commands').get(this.input);
		if (command) return command.run(context.message, context.args, context.context);
		throw new ReferenceError(`The command '${this.input}' does not exist.`);
	}
}
