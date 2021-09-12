import { envParseBoolean, envParseString } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { hours } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { Message, MessageAttachment } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envParseBoolean('INFLUX_ENABLED'),
	aliases: ['growth'],
	description: LanguageKeys.Commands.General.GrowthDescription,
	extendedHelp: LanguageKeys.Commands.General.GrowthExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	private nextRefresh = Date.now();
	private attachment: MessageAttachment | null = null;
	private pendingPromise: Promise<Buffer> | null = null;

	public async run(message: Message) {
		if (this.attachment && this.nextRefresh >= Date.now()) {
			return send(message, { files: [this.attachment] });
		}

		const image = await (this.pendingPromise ??= this.getOutfluxImage().finally(() => {
			this.pendingPromise = null;
		}));
		this.nextRefresh = Date.now() + hours(12);
		this.attachment = new MessageAttachment(image, 'growth.png');

		return send(message, { files: [this.attachment] });
	}

	private async getOutfluxImage() {
		try {
			return await fetch(
				envParseString('OUTFLUX_URL'),
				{
					headers: {
						'Content-Type': MimeTypes.ImagePng
					}
				},
				FetchResultTypes.Buffer
			);
		} catch {
			throw this.error(LanguageKeys.Commands.General.GrowthOutfluxError);
		}
	}
}
