const { Command } = require('../../index');

const random = num => Math.round(Math.random() * num);
const startsWith = (prefix, str) => {
    for (let i = prefix.length - 1; i >= 0; i--) { if (str[i] !== prefix[i]) return false; }
    return true;
};

const randomValues = {
    when: ['Soon™', 'Maybe tomorrow.', 'Maybe next year...', 'Right now.', 'In a few months.'],
    what: ['A plane.', 'What? Ask again.', 'A gift.', 'Nothing.', 'A ring.', "I don't know, maybe something."],
    howmuch: ['A lot.', 'A bit.', 'A few.', 'Ask me tomorrow.', "I don't know, ask a physicist.", 'Nothing.', `Within ${random(10)} and ${random(1000)}L.`, `${random(10)}e${random(1000)}L.`, "2 or 3 liters, I don't remember.", 'Infinity.', '1010 liters.'],
    howmany: ['A lot.', 'A bit.', 'A few.', 'Ask me tomorrow.', "I don't know, ask a physicist.", 'Nothing.', `Within ${random(10)} and ${random(1000)}.`, `${random(10)}e${random(1000)}.`, "2 or 3, I don't remember.", 'Infinity', '1010.'],
    why: ['Maybe genetics.', 'Because somebody decided it.', 'For the glory of satan, of course!', "I don't know, maybe destiny.", 'Because I said so.', 'I have no idea.', 'Harambe did nothing wrong.', 'Ask the owner of this server.', 'Ask again.', 'To get to the other side.', 'It says so in the Bible.'],
    doyoulie: ['Nope.', 'Nope.', 'Maybe.', 'Maybe.', 'Most likely.', 'YES!'],
    thisElse: ['Most likely.', 'Nope.', 'YES!', 'Maybe.']
};

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            spam: true,

            cooldown: 10,

            usage: '<question:string>',
            description: 'Skyra will read the Holy Bible to find the correct answer for your question.',
            extend: {
                EXPLANATION: 'This command provides you a random question based on your questions\' type. Be careful, it may be too smart.',
                ARGUMENTS: '<question>',
                EXP_USAGE: [
                    ['question', 'The Holy Question.']
                ],
                EXAMPLES: [
                    'Why did the chicken cross the road?'
                ]
            }
        });
    }

    async run(msg, [input]) {
        return msg.send(`🎱 Question by ${msg.author}: *${input}*\n${'```'}\n${this.generator(input)}${'```'}`);
    }

    generate(value) {
        const row = randomValues[value];
        return row[Math.floor(Math.random() * row.length)];
    }

    generator(input) {
        input = input.toLowerCase();
        if (input[input.length - 1] !== '?') throw "this doesn't seem to be a question.";
        if (startsWith('when', input)) return this.generate('when');
        if (startsWith('what', input)) return this.generate('what');
        if (startsWith('how much', input)) return this.generate('howmuch');
        if (startsWith('how many', input)) return this.generate('howmany');
        if (startsWith('why', input)) return this.generate('why');
        if (/(do|are).+you.+(lie|lying)/gi.test(input)) return this.generate('doyoulie');
        return this.generate('thisElse');
    }

};
