const { Command } = require('../../index');

const titles = {
    points: '🌐 Global Score Scoreboard',
    score: '🏡 Local Score Scoreboard',
    money: '💸 Money Scoreboard',
    reputation: '🙏 Reputation Scoreboard'
};

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['top', 'leaderboard'],
            mode: 1,
            spam: true,
            cooldown: 30,

            usage: '[global|local|money|reputation] [index:int]',
            usageDelim: ' ',
            description: 'Check the leaderboards.',
            extendedHelp: Command.strip`
                Am I first yet?

                = Usage =
                Skyra, top [list] [index]
                List  :: Either 'global', 'local', 'money' or 'reputation'.
                Index :: The index/page for the list.

                = Example =
                • Skyra, top global 2
                    Show the global leaderboard in the positions 10-20th.
            `
        });
    }

    async run(msg, [type = 'local', index = 1]) {
        if (type === 'global') type = 'points';
        else if (type === 'local') type = 'score';
        const list = Array.from(this.getList(msg, type).values());
        const position = list.findIndex(entry => entry.id === msg.author.id);
        const page = this.generatePage(msg, list, index, position, type);
        return msg.send(`${titles[type]}\n${page.join('\n')}`, { code: 'asciidoc' });
    }

    generatePage(msg, list, index, position, type) {
        const listSize = list.length;
        const pageCount = Math.ceil(listSize / 10);
        if (index > pageCount) index = 1;
        index = Math.max(index - 1, 0);
        const currentPage = [];
        const indexLength = String((index * 10) + 10).length;

        for (let i = 0; i < 10; i++) {
            const entry = list[i + (index * 10)];
            if (!entry) break;
            currentPage[i] = `• ${String(1 + i + (index * 10)).padStart(indexLength, ' ')}: ${this.keyUser(entry.id).padEnd(25, ' ')} :: ${entry[type]}`;
        }

        currentPage.push('');
        currentPage.push(`Page ${index + 1} / ${pageCount} | ${listSize.toLocaleString()} Total`);
        currentPage.push(`Your placing position is: ${position + 1}`);

        return currentPage;
    }

    keyUser(str) {
        const user = this.client.users.get(str);
        if (user) str = user.username;
        if (str.length < 25) return str;
        return `${str.substring(0, 22)}...`;
    }

    getList(msg, type) {
        switch (type) {
            case 'points':
            case 'money':
            case 'reputation':
                return this.client.handler.social.global.sorted(type);
            case 'score':
                return this.client.handler.social.local.sorted(msg.guild.id);
            // no default
        }
        return null;
    }

};
