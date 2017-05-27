const cheerio = require("cheerio");

const titles = {
  featured: "Featured stats",
  playedheroes: "Played Heroes",
  combat: "Combat stats",
  assists: "Assists",
  records: "Records",
  average: "Average stats",
  gamestats: "Game stats",
  awards: "Awards",
};

function progressBar(Prog) {
  const X = "———————————————————————————————————".slice(0, Prog).replace(/—/g, "■");
  const Y = "———————————————————————————————————".slice(Prog);
  return X + Y;
}

/* eslint-disable no-underscore-dangle, no-prototype-builtins, complexity */
class Overwatch {
  constructor(client) {
    Object.defineProperty(this, "_client", { value: client });
    Object.defineProperty(this, "resolvePlayer", { value: Overwatch.resolvePlayer });
    Object.defineProperty(this, "resolveProfile", { value: Overwatch.resolveProfile });
    Object.defineProperty(this, "fetchData", { value: Overwatch.fetchData });
    Object.defineProperty(this, "collect", { value: Overwatch.collect });
  }

  static resolvePlayer(user, pf, sv, hr, md) {
    return new Promise((resolve, reject) => {
      const platform = pf ? pf.toLowerCase() : null;
      const server = sv ? sv.toLowerCase() : null;
      const hero = hr ? hr.toLowerCase() : null;
      const mode = md ? md.toLowerCase() : null;
      const tag = user.split("#")[1];
      if (platform === "pc") {
        if (!tag) reject("you must write your discriminator number.");
        else if (!/\b\w{4,5}\b/.test(tag)) reject("you must write a valid discriminator number.");
        else resolve({ battletag: `${user.split("#")[0]}-${tag}`, user: user.split("#")[0], tag, platform, server, hero, mode });
      } else {
        resolve({ battletag: user, user, tag: null, platform, server, hero, mode });
      }
    });
  }

  static resolveProfile(player) {
    return new Promise(async (resolve, reject) => {
      const verifier = `https://playoverwatch.com/en-us/search/account-by-name/${encodeURIComponent(player.battletag)}`;
      const profiles = await this._client.fetch.JSON(verifier).then(d => d.data).catch(() => reject("please make sure you have written your profile correctly, this is case sensitive."));
      if (!profiles.length) reject("please make sure you have written your profile correctly, this is case sensitive.");
      const pf = player.platform;
      const sv = player.server;
      let careerLinks;
      if (!pf && !sv) careerLinks = profiles;
      else if (pf && !sv) careerLinks = profiles.filter(p => p.careerLink.split("/")[2] === pf);
      else if (!pf && sv) careerLinks = profiles.filter(p => p.careerLink.split("/")[3] === sv);
      else if (pf && sv) careerLinks = profiles.filter(p => p.careerLink === `/career/${pf}/${sv}/${player.battletag}`);
      switch (careerLinks.length) {
        case 0: reject(`this user doesn't have any data for \`${pf ? `Platform: ${pf} ` : ""}\`\`${sv ? `Server: ${sv}` : ""}\`.`);
          break;
        case 1: resolve(careerLinks[0]);
          break;
        default: resolve(careerLinks.sort((a, b) => b.level - a.level)[0]);
      }
    });
  }

  static collect(data, index) {
    return data.children[index].children[0].children[0].children[1].children.map(c => `\u200B • ${c.children.map(ch => ch.children[0].data).join(": **")}**`).join("\n");
  }

  static fetchData(url, type, hero, mode) {
    return new Promise(async (resolve, reject) => {
      const html = await this._client.fetch.kyraFetch(url).then(d => d.data);
      const $ = cheerio.load(html);
      let ProgressStats;
      if (!hero) { ProgressStats = $(`#${mode}`).children()["2"].children[0].children[2]; } else {
        const heroID = this._client.constants.owHero(hero) || reject("Unexpected error: Hexadecimal Character ID not found.");
        const getHero = $(`#${mode}`).children()["2"].children[0].children.find(c => c.attribs["data-category-id"] === heroID) || null;
        if (!getHero) reject(`this career profile doesn't have any data for ${this._client.funcs.toTitleCase(hero)}`);
        ProgressStats = getHero;
      }

      let data;
      switch (type) {
        case "featured": {
          const featuredData = $(`#${mode}`).children().first().children()["0"].children[2] || reject("I couldn't fetch any data.");
          data = featuredData.children.map(c => `\u200B • ${c.children[0].children[1].children.map(child => child.children[0].data).reverse().join(": **")}**`).join("\n");
          break;
        }
        case "playedheroes": {
          const heroesData = $(`#${mode}`).children()["1"].children[0].children[2] || reject("I couldn't fetch any data.");
          data = heroesData.children.map(c => `\`${progressBar(parseInt(c.attribs["data-overwatch-progress-percent"] * 35))}\`❯❯ **${c.children[1].children[1].children[0].children[0].data}**`).join("\n");
          break;
        }
        case "combat": {
          const chunk1 = this.collect(ProgressStats, 0) || reject("I couldn't fetch any data.");
          const chunk2 = this.collect(ProgressStats, 4) || reject("I couldn't fetch any data.");
          data = `${chunk1}\n${chunk2}`;
          break;
        }
        case "assists": data = this.collect(ProgressStats, 1) || reject("I couldn't fetch any data.");
          break;
        case "records": data = this.collect(ProgressStats, 2) || reject("I couldn't fetch any data.");
          break;
        case "average": data = this.collect(ProgressStats, 3) || reject("I couldn't fetch any data.");
          break;
        case "gamestats": data = this.collect(ProgressStats, 5) || reject("I couldn't fetch any data.");
          break;
        case "awards": {
          const chunk1 = this.collect(ProgressStats, 6) || reject("I couldn't fetch any data.");
          const chunk2 = this.collect(ProgressStats, 7) || reject("I couldn't fetch any data.");
          data = `${chunk1}\n${chunk2}`;
          break;
        }
        // no default
      }
      return resolve({ output: data, title: `${titles[type]}${hero ? ` for ${this._client.funcs.toTitleCase(hero)}` : ""}` });
    });
  }
}

exports.run = async (client, msg, [user, platform, server, hero, type = "featured", mode = "quickplay"]) => {
  const overwatch = new Overwatch(client);
  const resolvedPlayer = await overwatch.resolvePlayer(user, platform, server, hero, mode);
  const profile = await overwatch.resolveProfile(resolvedPlayer);
  const data = await overwatch.fetchData(`https://playoverwatch.com/en-us${profile.careerLink}`, type, hero, mode);
  const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setThumbnail(profile.portrait)
    .setTitle(`Overwatch Stats: ${resolvedPlayer.battletag.replace("-", "#")} (${mode})`)
    .setFooter("📊 Statistics")
    .setDescription([`**❯ ${data.title}**`, "", data.output].join("\n"))
    .setTimestamp();
  await msg.sendEmbed(embed);
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
  cooldown: 10,
};

const heroList = ["reaper", "tracer", "mercy", "hanzo", "torbjorn",
  "reinhardt", "pharah", "winston", "widowmaker", "bastion", "symmetra",
  "zenyatta", "genji", "roadhog", "mccree", "junkrat", "zarya", "soldier76",
  "s76", "lucio", "dva", "mei", "sombra", "ana", "orisa"];

const selectType = ["featured", "playedheroes", "combat", "assists", "records", "gamestats", "average", "awards"];

exports.help = {
  name: "overwatch",
  description: "Check stats from somebody in Overwatch.",
  usage: `<BattleTag:string> [pc|psn|xbl] [eu|us|kr] [${heroList.join("|")}] [${selectType.join("|")}] [quickplay|competitive]`,
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
    " ❯ Hero: choose the overwatch hero you want me to display info of.",
    " ❯ Type: choose between \"featured\", \"playedheroes\", \"combat\", \"assists\", \"records\", \"gamestats\", \"average\" and \"awards\".",
    " ❯ Gamemode: choose between competitive and quickplay.",
    "",
    "Notes:",
    " • If you only write your BattleTag, I'll display the profile with the higher rank. I mean, you have two profiles in PC, in EU you have 146 while in US you have 43, then, I'll display info for EU.",
    " • If hero is not specified, I'll display all heroes.",
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
    "",
    "&overwatch Knight#22123 Tracer combat",
    "❯❯ I'll display all combat stats for the hero Tracer, in quickplay, PC (EU)",
  ].join("\n"),
};
