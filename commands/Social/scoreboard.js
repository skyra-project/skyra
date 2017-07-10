const Command = require("../../classes/command");

const { fetchAll: fetchGlobal } = require("../../utils/managerSocialGlobal");
const { fetchAll: fetchLocal } = require("../../utils/managerSocialLocal");

const titles = {
    global: "🌐 Global Score Scoreboard",
    local: "🏡 Local Score Scoreboard",
    money: "💸 Money Scoreboard",
    reputation: "🙏 Reputation Scoreboard",
};

module.exports = class ScoreBoard extends Command {

    constructor(...args) {
        super(...args, "scoreboard", {
            aliases: ["top", "leaderboard"],
            mode: 1,
            spam: true,

            usage: "[global|local|money|reputation] [index:int]",
            usageDelim: " ",
            description: "Check the leaderboards.",
            extendedHelp: Command.strip`
                Am I first yet?

                = Usage =
                Skyra, top [list] [index]
                List  :: Either 'global', 'local', 'money' or 'reputation'.
                Index :: The index/page for the list.

                = Example =
                • Skyra, top global 2
                    Show the global leaderboard in the positions 10-20th.
            `,
        });
    }

    async run(msg, [type = "local", index = 1]) {
        const list = Array.from(this.getList(msg, type));
        const position = list.findIndex(entry => entry[0] === msg.author.id);
        const page = this.generatePage(msg, list, index, position);
        return msg.send(`${titles[type]}\n${page.join("\n")}`, { code: "asciidoc" });
    }

    generatePage(msg, list, index, position) {
        const listSize = list.length;
        const pageCount = Math.ceil(listSize / 10);
        if (index > pageCount) index = 1;
        index = Math.max(index - 1, 0);
        const currentPage = [];
        const indexLength = String((index * 10) + 10).length;

        for (let i = 0; i < 10; i++) {
            const entry = list[i + (index * 10)];
            if (!entry) break;
            currentPage[i] = `• ${String(1 + i + (index * 10)).padStart(indexLength, " ")}: ${this.keyUser(entry[0]).padEnd(25, " ")} :: ${entry[1]}`;
        }

        currentPage.push(`Page ${index + 1} / ${pageCount} | ${listSize.toLocaleString()} Total\n\n${currentPage.join("\n")}`);
        currentPage.push(`Your placing position is: ${position > 0 ? position + 1 : "Unranked"}`);

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
            case "global":
            case "money":
            case "reputation":
                return fetchGlobal()
                    .filter(profile => profile[type] > 0)
                    .sort((a, b) => (a[type] < b[type] ? 1 : -1));
            case "local":
                return fetchLocal().get(msg.guild.id)
                    .sort((a, b) => (a.score < b.score ? 1 : -1));
            // no default
        }
        return null;
    }

};
