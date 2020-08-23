import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';
import { MessageAttachment } from 'discord.js';
import type { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['eq'],
	cooldown: 10,
	description: (language) => language.get('commandExportQueueDescription'),
	extendedHelp: (language) => language.get('commandExportQueueExtended'),
	requiredGuildPermissions: ['ATTACH_FILES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	@requireQueueNotEmpty()
	public async run(message: KlasaMessage) {
		const data = JSON.stringify(message.guild!.music.queue.slice(0, 100).map((v) => v.track));
		await message.send(
			message.language.get('commandExportQueueSuccess', { guildName: message.guild!.name }),
			new MessageAttachment(Buffer.from(data), `${message.guild!.name}-${Date.now()}.squeue`)
		);
	}
}
