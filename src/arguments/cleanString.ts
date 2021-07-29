import { cleanMentions } from '#utils/util';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public async run(parameter: string, { message }: ArgumentContext) {
		const clean = message.guild ? cleanMentions(message.guild, parameter) : parameter;
		return this.ok(clean);
	}
}
