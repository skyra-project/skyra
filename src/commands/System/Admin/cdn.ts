import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageAttachment } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.CdnDescription,
	detailedDescription: LanguageKeys.Commands.System.CdnExtended,
	permissionLevel: PermissionLevels.BotOwner,
	subCommands: ['get', 'upload', 'delete']
})
export class UserCommand extends SkyraCommand {
	public async get(message: Message, args: SkyraCommand.Args) {
		const name = await args.pick('string');

		const entry = await this.container.grpc.cdn.get({ name });
		const files = [new MessageAttachment(Buffer.from(entry.content), name)];
		return send(message, { files });
	}

	public async upload(message: Message, args: SkyraCommand.Args) {
		const name = await args.pick('string');

		const url = args.finished ? message.attachments.first()?.url : await args.pick('url');
		if (!url) this.error(LanguageKeys.Commands.System.CdnNoAttachment);

		const blob = await fetch(url, FetchResultTypes.Blob);
		const contentType = blob.type;
		const content = new Uint8Array(await blob.arrayBuffer());
		const { cdn } = this.container.grpc;
		await cdn.upsert({ name, content, contentType });

		return send(message, { content: args.t(LanguageKeys.Commands.System.CdnUpload, { contentType, bytes: content.length }) });
	}

	public async delete(message: Message, args: SkyraCommand.Args) {
		const name = await args.pick('string');

		const { cdn } = this.container.grpc;
		await cdn.delete({ name });

		return send(message, { content: args.t(LanguageKeys.Commands.System.CdnDelete, { name }) });
	}
}
