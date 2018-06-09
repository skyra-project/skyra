const { Command, klasaUtil } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pull'],
			description: 'Update the bot',
			guarded: true,
			permissionLevel: 10,
			usage: '[branch:string]'
		});
	}

	async run(message, [branch = 'master']) {
		const pullResponse = await klasaUtil.exec(`git pull origin ${branch}`);
		const response = await message.channel.sendCode('prolog', [pullResponse.stdout, pullResponse.stderr || '✔'].join('\n-=-=-=-\n'));
		if (!await this.isCurrentBranch(branch)) {
			const switchResponse = await message.channel.send(`Switching to ${branch}...`);
			const checkoutResponse = await klasaUtil.exec(`git checkout ${branch}`);
			await switchResponse.edit([checkoutResponse.stdout, checkoutResponse.stderr || '✔'].join('\n-=-=-=-\n'), { code: 'prolog' });
			if ('reboot' in message.flags) return this.store.get('reboot').run(message);
		} else if (!pullResponse.stdout.includes('Already up-to-date.') && ('reboot' in message.flags)) {
			return this.store.get('reboot').run(message);
		}
		return response;
	}

	async isCurrentBranch(branch) {
		const { stdout } = await klasaUtil.exec('git symbolic-ref --short HEAD');
		return stdout === `refs/heads/${branch}\n` || stdout === `${branch}\n`;
	}

};
