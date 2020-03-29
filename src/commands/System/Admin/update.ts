import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { Emojis } from '@utils/constants';
import { CommandStore, KlasaMessage, util } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pull'],
			description: 'Update the bot',
			guarded: true,
			permissionLevel: PermissionLevels.BotOwner,
			usage: '[branch:string]'
		});
	}

	public async run(message: KlasaMessage, [branch = 'master']: [string?]) {
		await this.fetch(message, branch);
		await this.updateDependencies(message);
		await this.compile(message);
	}

	private async compile(message: KlasaMessage) {
		const { stderr } = await util.exec('yarn build')
			.catch(error => ({ stdout: '', stderr: (error && error.message) || error || '' }));
		if (stderr.length) throw stderr.trim();
		return message.channel.send(`${Emojis.GreenTick} Successfully compiled.`);
	}

	private async updateDependencies(message: KlasaMessage) {
		const { stderr } = await util.exec('yarn install --frozen-lockfile')
			.catch(error => ({ stdout: '', stderr: error?.message || error || '' }));
		if (stderr.length) throw stderr.trim();
		return message.channel.send(`${Emojis.GreenTick} Successfully update dependencies.`);
	}

	private async fetch(message: KlasaMessage, branch: string) {
		await util.exec('git fetch');
		const { stdout, stderr } = await util.exec(`git pull origin ${branch}`);

		// If it's up to date, do nothing
		if (/already up(?: |-)to(?: |-)date/i.test(stdout)) throw `${Emojis.GreenTick} Up to date.`;

		// If it was not a successful pull, return the output
		if (!this.isSuccessfulPull(stdout)) {
			// If the pull failed because it was in a different branch, run checkout
			if (!await this.isCurrentBranch(branch)) {
				return this.checkout(message, branch);
			}

			// If the pull failed because local changes, run a stash
			if (this.needsStash(stdout + stderr)) return this.stash(message);
		}

		// For all other cases, return the original output
		return message.send(util.codeBlock('prolog', [stdout || Emojis.GreenTick, stderr || Emojis.GreenTick].join('\n-=-=-=-\n')));
	}

	private async stash(message: KlasaMessage) {
		await message.send('Unsuccessful pull, stashing...');
		await util.sleep(1000);
		const { stdout, stderr } = await util.exec(`git stash`);
		if (!this.isSuccessfulStash(stdout + stderr)) {
			throw `Unsuccessful pull, stashing:\n\n${util.codeBlock('prolog', [stdout || '✔', stderr || '✔'].join('\n-=-=-=-\n'))}`;
		}

		return message.send(util.codeBlock('prolog', [stdout || '✔', stderr || '✔'].join('\n-=-=-=-\n')));
	}

	private async checkout(message: KlasaMessage, branch: string) {
		await message.send(`Switching to ${branch}...`);
		await util.exec(`git checkout ${branch}`);
		return message.send(`${Emojis.GreenTick} Switched to ${branch}.`);
	}

	private async isCurrentBranch(branch: string) {
		const { stdout } = await util.exec('git symbolic-ref --short HEAD');
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

}
