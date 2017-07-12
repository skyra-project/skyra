const { Command, Constants: { httpResponses }, Discord: { Embed } } = require("../../index");
const snekfetch = require("snekfetch");
const cheerio = require("cheerio");

/* eslint-disable class-methods-use-this */
module.exports = class Google extends Command {

    constructor(...args) {
        super(...args, "google", {
            aliases: ["search"],
            botPerms: ["EMBED_LINKS"],
            mode: 1,

            usage: "<input:string>",
            description: "Search stuff through Google.",
        });
    }

    async run(msg, [input]) {
        const data = await snekfetch.get(`http://google.com/search?client=chrome&rls=en&ie=UTF-8&oe=UTF-8&lr=lang_en&q=${encodeURIComponent(input)}`);
        const $ = cheerio.load(data);
        let results = [];
        let raw;

        $(".g").each((i) => { results[i] = {}; });
        $(".g>.r>a").each((i, e) => {
            raw = e.attribs.href;
            results[i].link = raw.substr(7, raw.indexOf("&sa=U") - 7);
        });
        $(".g>.s>.st").each((i, e) => { results[i].description = this.getText(e); });

        results = results.filter(r => r.link && r.description);
        results = results.splice(0, 4);

        if (!results.length) throw httpResponses(404);
        const embed = new Embed()
            .setColor(msg.guild.me.highestRole.color || 0xdfdfdf)
            .setFooter("Google Search")
            .setDescription(results.map(r => `${decodeURIComponent(r.link)}\n\t${r.description}\n`).join("\n"))
            .setTimestamp();
        return msg.send(`Search results for \`${input}\``, { embed });
    }

    getText(children) {
        if (children.children) return this.getText(children.children);
        return children.map(c => (c.children ? this.getText(c.children) : c.data).join(""));
    }

};
