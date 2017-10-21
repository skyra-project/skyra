const { Command, Providers: { rethink } } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['choice'],
            spam: true,
            permLevel: 10,

            usage: '<computers|history|anime|animation|books|animals|celebrities|art|comics|science|sciencegadgets|boardgames|mythology|films|geography|sports|politics|music|videogames|television|general|mathematics|vehicles>',
            usageDelim: ',',
            description: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
            extend: {
                EXPLANATION: [
                    'I have an existencial doubt... should I wash the dishes or throw them throught the window? The search',
                    'continues. List me items separated by `\', \'` and I will choose one them. On a side note, I am not',
                    'responsible of what happens next.'
                ].join(' '),
                ARGUMENTS: '<words>',
                EXP_USAGE: [
                    ['words', 'A list of words separated by comma and space.']
                ],
                EXAMPLES: [
                    'Should Wash the dishes, Throw the dishes throught the window',
                    'Cat, Dog'
                ]
            }
        });

        this.games = new Set();
        this.questions = new Map();
    }

    async run(msg, [type]) {
        if (this.games.has(msg.channel.id)) throw 'There is a game in progress.';
        const questions = this.questions.get(type).content;
        return this.question(msg, questions);
    }

    async question(msg, questions) {
        const selected = questions[Math.floor(Math.random() * questions.length)];
        await msg.channel.send(selected.question);
        const response = await msg.channel.awaitMessages(message => message.content === selected.answer, { time: 30000, max: 1 });
        if (response.size === 0) {
            this.games.delete(msg.channel.id);
            return msg.channel.send('Seems no one got it!');
        }
        return this.question(msg, questions);
    }

    async init() {
        const data = await rethink.getAll('trivia');
        for (let i = 0; i < data.length; i++)
            this.questions.set(data[i].id, data[i]);
    }

};
