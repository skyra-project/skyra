import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { MessageAttachment } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['eq'],
	cooldown: 10,
	// description: (language) => language.get('COMMAND_EXPORT_DESCRIPTION'),
	// extendedHelp: (language) => language.get('COMMAND_EXPORT_EXTENDED'),
	requiredGuildPermissions: ['ATTACH_FILES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	@requireQueueNotEmpty()
	public async run(message: KlasaMessage) {
		const data = JSON.stringify(message.guild!.music.queue.map((v) => v.url));
		await message.send(
			`Here's the queue for ${message.guild!.name}!`,
			new MessageAttachment(Buffer.from(data), `${message.guild!.name}-${Date.now()}.squeue`)
		);
	}
}
