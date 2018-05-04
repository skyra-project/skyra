const { Command, MessageEmbed } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_LOVE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_LOVE_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});
		this.spam = true;
	}

	async run(msg, [user]) {
		const isSelf = msg.author.id === user.id;
		const percentage = isSelf ? 1 : Math.random();
		const estimatedPercentage = Math.ceil(percentage * 100);

		let result;
		if (estimatedPercentage < 45) {
			result = msg.language.get('COMMAND_LOVE_LESS45');
		} else if (estimatedPercentage < 75) {
			result = msg.language.get('COMMAND_LOVE_LESS75');
		} else if (estimatedPercentage < 100) {
			result = msg.language.get('COMMAND_LOVE_LESS100');
		} else {
			result = isSelf
				? msg.language.get('COMMAND_LOVE_ITSELF')
				: msg.language.get('COMMAND_LOVE_100');
		}

		const embed = new MessageEmbed()
			.setColor(msg.member.colorRole ? msg.member.colorRole.color : 0xE840CF)
			.setAuthor('❤ Love Meter ❤', msg.author.displayAvatarURL())
			.setThumbnail('https://twemoji.maxcdn.com/2/72x72/1f49e.png')
			.setDescription([
				`💗 **${user.tag}**`,
				`💗 **${msg.author.tag}**\n`,
				`${estimatedPercentage}% | \`\u200b${'█'.repeat(Math.round(percentage * 40)).padEnd(40)}\u200b\` |\n`,
				`**${msg.language.get('COMMAND_LOVE_RESULT')}**: ${result}`
			].join('\n'));

		return msg.sendEmbed(embed);
	}

};
