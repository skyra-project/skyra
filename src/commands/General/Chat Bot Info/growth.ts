import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ENABLE_INFLUX } from '#root/config';
import { Mime } from '#utils/constants';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/time-utilities';
import { Message, MessageAttachment } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.General.GrowthDescription,
	extendedHelp: LanguageKeys.Commands.General.GrowthExtended,
	permissions: ['ATTACH_FILES'],
	enabled: ENABLE_INFLUX
})
export default class extends SkyraCommand {
	private cachedGrowth: CachedImage = { cachedDate: Date.now(), buffer: null };
	public async run(message: Message) {
		if (this.cachedGrowth.buffer && this.cachedGrowth.cachedDate + Time.Hour * 12 >= Date.now()) {
			return this.sendAttachment(message, this.cachedGrowth.buffer);
		}

		const image = await this.getOutfluxImage();
		this.cachedGrowth.cachedDate = Date.now();
		this.cachedGrowth.buffer = image;

		return this.sendAttachment(message, image);
	}

	private sendAttachment(message: Message, buffer: Buffer) {
		return message.send(new MessageAttachment(buffer, 'growth.png'));
	}

	private async getOutfluxImage() {
		try {
			return await fetch(
				'http://localhost:8286',
				{
					headers: {
						'Content-Type': Mime.Types.ImagePng
					}
				},
				FetchResultTypes.Buffer
			);
		} catch {
			throw this.error(LanguageKeys.Commands.General.GrowthOutfluxError);
		}
	}
}

interface CachedImage {
	cachedDate: number;
	buffer: Buffer | null;
}
