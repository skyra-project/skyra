import { SubCommandEntry } from './SubCommandEntry';

export class SubCommandEntryMethod extends SubCommandEntry {
	public run(context: SubCommandEntry.RunContext): unknown {
		const method = Reflect.get(context.command, this.input);
		if (method) return Reflect.apply(method, context.command, [context.message, context.args, context.context]);
		throw new ReferenceError(`The method '${this.input}' does not exist for the command '${context.command.name}'.`);
	}
}
