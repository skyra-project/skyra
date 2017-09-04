const { Command, Constants: { httpResponses } } = require('../../index');
const { XmlEntities } = require('html-entities');
const { decode } = new XmlEntities();
const snekfetch = require('snekfetch');

const request = input => snekfetch.get(`https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${input}`)
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

    async run(msg, [input]) {
        const data = await request(encodeURIComponent(input));
        if (!data.tuc || !data.tuc[0]) throw httpResponses(404);

        const final = [];
        let index = 1;
        for (let item of Object.entries(data.tuc.find(entry => entry.meanings).meanings.slice(0, 5))) { // eslint-disable-line no-restricted-syntax
            item = decode(item[1].text.replace(/<\/?i>/g, ''));
            final.push(`**\`${index}\` ❯** ${item.replace(/`/g, '\\`')}`);
            index++;
        }

        return msg.send(`Search results for \`${input}\`:\n${final.join('\n')}`);
    }

};
