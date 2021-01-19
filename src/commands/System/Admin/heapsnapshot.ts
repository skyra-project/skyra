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
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import { writeHeapSnapshot } from 'v8';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Admin.HeapSnapshotDescription,
	extendedHelp: LanguageKeys.Commands.Admin.HeapSnapshotExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		await message.send('Capturing HEAP Snapshot. This may take a while...');

		// Capture the snapshot (this freezes the entire VM)
		const filename = writeHeapSnapshot();

		return message.send(`Captured in \`${filename}\`, check! Remember, do NOT share this with anybody, it may contain a lot of sensitive data.`);
	}
}
