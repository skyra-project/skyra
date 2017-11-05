const { structures: { Command } } = require('../../index');
const { XmlEntities } = require('html-entities');
const { decode } = new XmlEntities();
const snekie = require('snekfetch');

const request = input => snekie.get(`https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${input}`)
	.then(data => JSON.parse(data.text));

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			mode: 1,
			cooldown: 10,

			usage: '<input:string>',
			description: 'Check the definition of a word.',
			extendedHelp: Command.strip`
                What does "heel" mean?

                ⚙ | ***Explained usage***
                Skyra, define [word]
                Word :: The word or phrase you want to get the definition from.

                🔗 | ***Examples***
                • Skyra, define heel
                    1 ❯ Tilt to one side; "The balloon heeled over"; "the wind made the vessel heel"; "The ship listed to starboard".
                    2 ❯ To arm with a gaff, as a cock for fighting.
                    3 ❯ In a carding machine, the part of a flat nearest the cylinder.
                    4 ❯ Part of shoe.
                    5 ❯ The part of a shoe's sole which supports the foot's heel.
            `
		});
	}

	async run(msg, [input], settings, i18n) {
		const data = await request(encodeURIComponent(input));
		if (!data.tuc || !data.tuc[0])
			throw i18n.get('COMMAND_DEFINE_NOTFOUND');

		const entry = data.tuc.find(obj => obj.meanings);
		if (!entry)
			throw i18n.get('COMMAND_DEFINE_NOTFOUND');

		const final = [];
		const limit = Math.min(5, entry.meanings.length);
		for (let i = 0; i < limit; i++) {
			const item = decode(entry.meanings[i].text.replace(/<\/?i>/g, '').replace(/\[\/?i\]/g, ''));
			final.push(`**\`${i + 1}\` ❯** ${item.replace(/`/g, '\\`')}`);
		}

		return msg.send(i18n.get('COMMAND_DEFINE', input, final.join('\n')));
	}

};
