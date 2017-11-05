const { structures: { Command }, util: { RichDisplay } } = require('../../index');
const { MessageEmbed, Collection } = require('discord.js');
const availableBanners = require('../../assets/banners.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['EMBED_LINKS'],
			permLevel: 10,
			mode: 1,
			spam: true,
			cooldown: 10,

			description: 'Test.'
		});
		this.album = new RichDisplay(
			new MessageEmbed()
				.setColor(0xff00ff)
		);
		this.collectors = new Collection();

		for (const [key, value] of Object.entries(availableBanners))
			this.album.addPage(embed => embed
				.setTitle(key)
				.setDescription(`${value.title}: ${value.price} S`)
				.setImage(`http://kyradiscord.weebly.com/files/theme/banners/${key}.png`));
	}

	async run(msg) {
		const existing = this.collectors.get(msg.channel.id);
		if (existing) existing.stop();
		const collector = await this.album.run(msg, { filter: (reaction, user) => user === msg.author });
		this.collectors.set(msg.channel.id, collector);
		collector.on('end', () => this.collectors.delete(msg.channel.id));
	}

};
