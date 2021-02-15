import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { Emojis, rootFolder } from '#utils/constants';
import { exec } from '#utils/Promisified/exec';
import { sleep } from '#utils/Promisified/sleep';
import { ApplyOptions } from '@sapphire/decorators';
import { codeBlock, cutText } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import type { ExecOptions } from 'child_process';
import { rm } from 'fs/promises';
import { resolve } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pull'],
	description: LanguageKeys.Commands.Admin.UpdateDescription,
	extendedHelp: LanguageKeys.Commands.Admin.UpdateExtended,
	guarded: true,
	strategyOptions: { flags: ['clean'] },
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const branch = args.finished ? 'main' : await args.pick('string');

		// Fetch repository and pull if possible
		await this.fetch(message, branch);

		// Update Yarn dependencies
		await this.updateDependencies(message);

		// If there is --clean in the update then remove the dist
		if (args.getFlags('clean')) await this.cleanDist(message);

		// Compile TypeScript to JavaScript
		await this.compile(message);
	}

	private async compile(message: Message) {
		const { stderr, code } = await this.exec('yarn build');
		if (code !== 0 && stderr.length) throw stderr.trim();
		return message.channel.send(`${Emojis.GreenTick} Successfully compiled.`);
	}

	private async cleanDist(message: Message) {
		await rm(resolve(rootFolder, 'dist'), { recursive: true, force: true });
		return message.channel.send(`${Emojis.GreenTick} Successfully cleaned old dist directory.`);
	}

	private async updateDependencies(message: Message) {
		const { stderr, code } = await this.exec('yarn install --frozen-lockfile --ignore-scripts', { env: { ...process.env, NODE_ENV: undefined } });
		if (code !== 0 && stderr.length) throw stderr.trim();
		return message.channel.send(`${Emojis.GreenTick} Successfully updated dependencies.`);
	}

	private async fetch(message: Message, branch: string) {
		await this.exec('git fetch');
		const { stdout, stderr } = await this.exec(`git pull origin ${branch}`);

		// If it's up to date, do nothing
		if (/already up(?: |-)to(?: |-)date/i.test(stdout)) throw `${Emojis.GreenTick} Up to date.`;

		// If it was not a successful pull, return the output
		if (!this.isSuccessfulPull(stdout)) {
			// If the pull failed because it was in a different branch, run checkout
			if (!(await this.isCurrentBranch(branch))) {
				return this.checkout(message, branch);
			}

			// If the pull failed because local changes, run a stash
			if (this.needsStash(stdout + stderr)) return this.stash(message);
		}

		// For all other cases, return the original output
		return message.send(
			codeBlock('prolog', [cutText(stdout, 1800) || Emojis.GreenTick, cutText(stderr, 100) || Emojis.GreenTick].join('\n-=-=-=-\n'))
		);
	}

	private async stash(message: Message) {
		await message.send('Unsuccessful pull, stashing...');
		await sleep(1000);
		const { stdout, stderr } = await this.exec('git stash');
		if (!this.isSuccessfulStash(stdout + stderr)) {
			throw `Unsuccessful pull, stashing:\n\n${codeBlock('prolog', [stdout || '✔', stderr || '✔'].join('\n-=-=-=-\n'))}`;
		}

		return message.send(codeBlock('prolog', [cutText(stdout, 1800) || '✔', cutText(stderr, 100) || '✔'].join('\n-=-=-=-\n')));
	}

	private async checkout(message: Message, branch: string) {
		await message.send(`Switching to ${branch}...`);
		await this.exec(`git checkout ${branch}`);
		return message.send(`${Emojis.GreenTick} Switched to ${branch}.`);
	}

	private async isCurrentBranch(branch: string) {
		const { stdout } = await this.exec('git symbolic-ref --short HEAD');
		return stdout === `refs/heads/${branch}\n` || stdout === `${branch}\n`;
	}

	private isSuccessfulPull(output: string) {
		return /\d+\s*file\s*changed,\s*\d+\s*insertions?\([+-]\),\s*\d+\s*deletions?\([+-]\)/.test(output);
	}

	private isSuccessfulStash(output: string) {
		return output.includes('Saved working directory and index state WIP on');
	}

	private needsStash(output: string) {
		return output.includes('Your local changes to the following files would be overwritten by merge');
	}

	private async exec(script: string, options?: ExecOptions) {
		try {
			const result = await exec(script, { ...options, encoding: 'utf8' });
			return { ...result, code: 0 };
		} catch (error) {
			return { stdout: '', stderr: error?.message || error || '', code: error.code ?? 1 };
		}
	}
}
