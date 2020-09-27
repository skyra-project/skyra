import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';
import { serialize } from 'binarytf';
import { MessageAttachment } from 'discord.js';
import type { KlasaMessage } from 'klasa';

export const maximumExportQueueSize = 100;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['eq'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Music.ExportQueueDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.ExportQueueExtended),
	requiredGuildPermissions: ['ATTACH_FILES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	@requireQueueNotEmpty()
	public async run(message: KlasaMessage) {
		const data = serialize(message.guild!.music.queue.slice(0, maximumExportQueueSize).map((v) => v.track));
		await message.send(
			message.language.get(LanguageKeys.Commands.Music.ExportQueueSuccess, { guildName: message.guild!.name }),
			new MessageAttachment(Buffer.from(data), `${message.guild!.name}-${Date.now()}.squeue`)
		);
	}
}
