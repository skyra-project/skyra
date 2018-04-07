const { Command } = require('../../index');

const titles = {
	global: '🌐 Global Score Scoreboard',
	local: '🏡 Local Score Scoreboard'
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['top', 'scoreboard'],
			bucket: 2,
			cooldown: 10,
			description: msg => msg.language.get('COMMAND_LEADERBOARD_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_LEADERBOARD_EXTENDED'),
			runIn: ['text'],
			usage: '[global|local] [index:integer]',
			usageDelim: ' '
		});
		this.spam = true;
	}

	async run(msg, [type = 'local', index = 1]) {
		const list = await (type === 'local'
			? this.client.leaderboard.getMembers(msg.guild.id)
			: this.client.leaderboard.getUsers());

		const { position } = list.get(msg.author.id) || { position: list.size + 1 };
		const page = await this.generatePage(msg, list, index - 1, position);
		return msg.sendMessage(`${titles[type]}\n${page.join('\n')}`, { code: 'asciidoc' });
	}

	async generatePage(msg, list, index, position) {
		if (index > list.size / 10) index = 0;
		const retrievedPage = [], promises = [],
			page = [], listSize = list.size, pageCount = Math.ceil(listSize / 10),
			indexLength = ((index * 10) + 10).toString().length, positionOffset = index * 10;
		for (const [id, value] of list) {
			if (positionOffset > value.position) continue;
			if (positionOffset + 10 < value.position) break;
			retrievedPage.push(value);
			if (!value.name) promises.push(this.client.fetchUsername(id).then(username => { value.name = username; }));
		}

		if (promises.length) {
			await msg.sendMessage(msg.language.get('SYSTEM_FETCHING_USERS'));
			await Promise.all(promises);
		}
		for (const value of retrievedPage) {
			page.push(`• ${value.position.toString().padStart(indexLength, ' ')}: ${this.keyUser(value.name).padEnd(25, ' ')} :: ${value.points}`);
		}

		page.push('');
		page.push(msg.language.get('LISTIFY_PAGE', index + 1, pageCount, listSize.toLocaleString()));
		page.push(msg.language.get('COMMAND_SCOREBOARD_POSITION', position));

		return page;
	}

	keyUser(str) {
		const user = this.client.users.get(str);
		if (user) str = user.username;
		if (str.length < 25) return str;
		return `${str.substring(0, 22)}...`;
	}

};
