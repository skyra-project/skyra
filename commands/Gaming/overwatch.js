const snekfetch = require("snekfetch");
const { get: fetchProfile } = require("../../functions/overwatch");

const OVERWATCH = require("../../utils/overwatch.js");

// function progressBar(Prog) {
//   const X = "———————————————————————————————————".slice(0, Prog).replace(/—/g, "■");
//   const Y = "———————————————————————————————————".slice(Prog);
//   return X + Y;
// }

const emojis = {
    bronze: { emoji: "<:Bronze:326683073691385856>", text: "(B)" },
    silver: { emoji: "<:Silver:326683073343127554>", text: "(S)" },
    gold: { emoji: "<:Gold:326683073955758100>", text: "(G)" },
    platinum: { emoji: "<:Platinum:326683073288863745>", text: "(P)" },
    diamond: { emoji: "<:Diamond:326683073959952384>", text: "(D)" },
    master: { emoji: "<:Master:326683073628471298>", text: "(M)" },
    grandmaster: { emoji: "<:GrandMaster:326683074157084672>", text: "(GM)" },
};

const list = data => Object.entries(data).map(([key, value]) => `**${key}**: ${value}`).join("\n");

/* eslint-disable class-methods-use-this */
class Overwatch {
    constructor(msg, user, platform, server, type, gamemode) {
        this.msg = msg;
        this.client = msg.client;
        this.api = "https://playoverwatch.com/en-us/search/account-by-name/";
        this.user = user;
        this.platform = platform ? platform.toLowerCase() : null;
        this.server = server ? server.toLowerCase() : null;
        this.type = type.toLowerCase();
        this.gamemode = gamemode.toLowerCase();
    }

    resolvePlayer() {
        const tag = this.user.split("#")[1];
        if (tag || this.platform === "pc") {
            if (!tag) throw "you must write your discriminator number.";
            else if (!/\b\w{4,5}\b/.test(tag)) throw "you must write a valid discriminator number.";
            else {
                return ({
                    battletag: `${this.user.split("#")[0]}-${tag}`,
                    user: this.user.split("#")[0],
                    tag,
                });
            }
        } else {
            return ({
                battletag: this.user,
                user: this.user,
                tag: null,
            });
        }
    }

    async resolveProfile(player) {
        const verifier = `${this.api + encodeURIComponent(player.user)}${player.tag ? `-${player.tag}` : ""}`;
        const profiles = await snekfetch.get(verifier).then(d => JSON.parse(d.text)).catch(() => { throw "make sure you have written your profile correctly, this is case sensitive."; });
        if (!profiles.length) throw "make sure you have written your profile correctly, this is case sensitive.";
        const pf = player.platform;
        const sv = player.server;
        let careerLinks;
        if (!pf && !sv) careerLinks = profiles;
        else if (pf && !sv) careerLinks = profiles.filter(p => p.careerLink.split("/")[2] === pf);
        else if (!pf && sv) careerLinks = profiles.filter(p => p.careerLink.split("/")[3] === sv);
        else if (pf && sv) careerLinks = profiles.filter(p => p.careerLink === `/career/${pf}/${sv}/${player.battletag}`);
        switch (careerLinks.length) {
            case 0: throw `this user doesn't have any data for \`${pf ? `Platform: ${pf} ` : ""}\`\`${sv ? `Server: ${sv}` : ""}\`.`;
            case 1: return (careerLinks[0]);
            default: return (careerLinks.sort((a, b) => b.level - a.level)[0]);
        }
    }

    async fetchData(selected) {
        const path = selected.split("/");
        path[path.length - 1] = encodeURIComponent(path[path.length - 1]);
        const data = await fetchProfile(`https://playoverwatch.com/en-us${path.join("/")}`);
        const { overview, url } = data;
        const statistics = data[this.gamemode];
        const output = { overview, url };
        switch (this.type) {
            case "featured":
                output.title = "Featured";
                output.data = `**Competitive rank**: ${overview.competitiveRank.rank ? this.resolveEmoji(overview.competitiveRank.rank) : "Unranked"}\n${list(statistics.highlight)}`;
                return output;
            case "playedheroes": return OVERWATCH("playedheroes", data, { platform: this.platform, server: this.server, gamemode: this.gamemode });
            case "combat":
                output.title = "Combat";
                output.data = list(statistics.stats.Combat);
                return output;
            case "assists":
                output.title = "Assists";
                output.data = list(statistics.stats.Assists);
                return output;
            case "records":
                output.title = "Records";
                output.data = list(statistics.stats.Best);
                return output;
            case "gamestats":
                output.title = "Featured";
                output.data = `${list(statistics.stats.Game)}\n${list(statistics.stats.Deaths)}\n\n${list(statistics.stats.Miscellaneous)}`;
                return output;
            case "average":
                output.title = "Average Stats";
                output.data = list(statistics.stats.Average);
                return output;
            case "awards":
                output.title = "Awards";
                output.data = list(statistics.stats["Match Awards"]);
                return output;
      // no default
        }
        return null;
    }

    resolveEmoji(rank) {
        const permission = this.msg.guild ? this.msg.channel.permissionsFor(this.msg.guild.me).has("USE_EXTERNAL_EMOJIS") : true;
        let role;
        if (rank < 1500) role = emojis.bronze;
        else if (rank < 2000) role = emojis.silver;
        else if (rank < 2500) role = emojis.gold;
        else if (rank < 3000) role = emojis.platinum;
        else if (rank < 3500) role = emojis.diamond;
        else if (rank < 4000) role = emojis.master;
        else role = emojis.grandmaster;
        return `${rank} ${permission ? role.emoji : role.text}`;
    }
}

exports.run = async (client, msg, [user, platform, server, type = "featured", mode = "quickplay"]) => {
    if (mode === "qp") mode = "quickplay";
    if (mode === "comp") mode = "competitive";
    const overwatch = new Overwatch(msg, user, platform, server, type, mode);
    const resolvedPlayer = await overwatch.resolvePlayer();
    const resolved = await overwatch.resolveProfile(resolvedPlayer);
    const output = await overwatch.fetchData(resolved.careerLink);
    if (output instanceof Buffer) return msg.send({ files: [{ attachment: output, name: "overwatch.png" }] });
    const { overview, title, data, url } = output;
    const embed = new client.methods.Embed()
        .setURL(url)
        .setColor(msg.color)
        .setThumbnail(overview.profile.avatar)
        .setTitle(`Overwatch Stats: ${resolved.platformDisplayName} [${mode === "quickplay" ? "QP" : "COMP"}]`)
        .setFooter("📊 Statistics")
        .setDescription(`**❯ ${title}**\n\n${data}`)
        .setTimestamp();
    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["ow"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 2,
};

const selectType = ["featured", "playedheroes", "combat", "assists", "records", "gamestats", "average", "awards"];

exports.help = {
    name: "overwatch",
    description: "Check stats from somebody in Overwatch.",
    usage: `<BattleTag:string> [pc|psn|xbl] [eu|us|kr] [${selectType.join("|")}] [qp|quickplay|comp|competitive]`,
    usageDelim: " ",
    extendedHelp: [
        "Cheers love! The cavalry is here!",
        "",
        "Usage:",
        "&overwatch <BattleTag> [platform] [server] [hero] [type] [gamemode]",
        "",
        " ❯ BattleTag: write your battletag, in PC, it must have the format: username#0000, console players don't have discriminator number.",
        " ❯ Platform: choose between PC, PSN or XBL.",
        " ❯ Server: choose between EU (Europe), US (America) or KR (Asia).",
        " ❯ Type: choose between \"featured\", \"playedheroes\", \"combat\", \"assists\", \"records\", \"gamestats\", \"average\" and \"awards\".",
        " ❯ Gamemode: choose between competitive and quickplay.",
        "",
        "Notes:",
        " • If you only write your BattleTag, I'll display the profile with the higher rank. I mean, you have two profiles in PC, in EU you have 146 while in US you have 43, then, I'll display info for EU.",
        " • If type is not specified, I'll display the game stats.",
        " • If gamemode not specified, I display Quickplay information.",
        "",
        "Examples:",
        "&overwatch Knight#22123 pc eu",
        "&overwatch Knight#22123",
        "❯❯ The two examples above will display the same information, because when the discriminator is specified, I'll take the platform PC, and this user has higher rank in EU.",
        "",
        "&overwatch Knight#22123 competitive",
        "❯❯ I'll display the game stats for competitive, in PC (EU)",
    ].join("\n"),
};
