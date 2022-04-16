/**
 * @license
 * MIT License
 *
 * Copyright (c) 2017-2019 dirigeants
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { rootFolder } from '#utils/constants';
import { bold } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { reply, send } from '@sapphire/plugin-editable-commands';
import { filterNullish, inlineCodeBlock } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import type { Message } from 'discord.js';
import { join } from 'node:path';
import { writeHeapSnapshot } from 'node:v8';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Admin.HeapSnapshotDescription,
	detailedDescription: LanguageKeys.Commands.Admin.HeapSnapshotExtended,
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message) {
		await reply(message, 'Capturing Heap Snapshot. This may take a while...');

		// Capture the snapshot (this freezes the entire VM)
		const fileName = writeHeapSnapshot();

		const outputMessage = [
			//
			`Heapsnapshot stored at ${inlineCodeBlock(fileName)}!`,
			envParseString('NODE_ENV') === 'production'
				? `\nThis file can be extracted from the Docker container using the following command: ${inlineCodeBlock(
						`docker cp skyra:${join(rootFolder, fileName)} ./${fileName}`
				  )}`
				: null,
			`\nRemember, do ${bold('NOT')} share this with anybody, it may contain a lot of sensitive data.`
		]
			.filter(filterNullish)
			.join('\n');

		return send(message, outputMessage);
	}
}
