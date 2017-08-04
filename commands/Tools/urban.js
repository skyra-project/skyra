const { Command, Constants: { httpResponses }, Discord: { Embed } } = require('../../index');
const toTitleCase = require('../../functions/toTitleCase');
const splitText = require('../../functions/splitText');
const snekfetch = require('snekfetch');

/* eslint-disable class-methods-use-this */
module.exports = class UrbanDictionary extends Command {

    constructor(...args) {
        super(...args, 'urban', {
            aliases: ['urbandictionary'],
            botPerms: ['EMBED_LINKS'],
            mode: 1,

            usage: '<query:string> [index:int]',
            usageDelim: ' #',
            description: 'Check the definition of a word on UrbanDictionary.',
            extendedHelp: Command.strip`
                What does "spam" mean?
                
                = Usage =
                Skyra, urban [word] #[index]
                Word :: The word or phrase you want to get the definition from.
                Index :: Defaults to 1, the page you wish to read.
                
                = Example =
                • Skyra, urban spam
                    spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam
            `
        });
    }

    async run(msg, [query, ind = 1]) {
        const index = ind - 1;
        if (index < 0) throw "You can't use an index equal or below zero.";
        const { list } = await snekfetch.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`)
            .then(data => JSON.parse(data.text));
        const result = list[index];
        if (result === undefined) throw httpResponses(404);
        const definition = this.content(result.definition, result.permalink);
        const embed = new Embed()
            .setTitle(`Word: ${toTitleCase(query)}`)
            .setURL(result.permalink)
            .setColor(msg.color)
            .setThumbnail('http://i.imgur.com/CcIZZsa.png')
            .setDescription([
                `**Definition:** ${ind} out of ${list.length}\n_${definition}_`,
                `\n**Example:**\n${result.example}`,
                `\n**Submitted by** ${result.author}`
            ].join('\n'))
            .addField('\u200B', `\\👍 ${result.thumbs_up}`, true)
            .addField('\u200B', `\\👎 ${result.thumbs_down}`, true)
            .setFooter('© Urban Dictionary');

        return msg.send({ embed });
    }

    content(definition, permalink) {
        if (definition.length < 750) return definition;
        return `${splitText(definition, 750)}...\nRead the full definition here: ${permalink}`;
    }

};
