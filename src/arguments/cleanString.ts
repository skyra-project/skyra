import { cleanMentions } from '#utils/util';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public run(parameter: string, { message }: Argument.Context) {
		const clean = message.guild ? cleanMentions(message.guild, parameter) : parameter;
		return this.ok(clean);
	}
}
