import { CommandContext, HandledCommandContext, ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['sn'],
	cooldown: 10,
	description: language => language.tget('COMMAND_SETNICKNAME_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_SETNICKNAME_EXTENDED'),
	requiredMember: true,
	optionalDuration: true,
	requiredGuildPermissions: ['MANAGE_NICKNAMES'],
	permissionLevel: PermissionLevels.Moderator,
	usage: '<users:...user{,10}> [nickname:nickname] [duration:timespan] [reason:...string]',
	usageDelim: ' '
})
export default class extends ModerationCommand {

	private kStringArgtype = this.client.arguments.get('string')!;

	public async init() {
		this.createCustomResolver('nickname', (arg, possible, message) => arg ?? this.kStringArgtype.run(arg, possible, message));
	}

	protected resolveOverloads([targets, ...args]: readonly unknown[]): CommandContext & { nickname: string } {
		return {
			targets: targets as User[],
			duration: args[1] as number | null,
			reason: args[2] as string | null,
			nickname: args[0] as string
		};
	}

	protected handle(message: KlasaMessage, context: HandledCommandContext & { nickname: string }) {
		return message.guild!.security.actions.setNickname({
			user_id: context.target.id,
			moderator_id: message.author.id,
			reason: context.reason
		}, context.nickname, this.getTargetDM(message, context.target));
	}

}
