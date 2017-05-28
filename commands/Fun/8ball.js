/* eslint-disable no-throw-literal */
class EightBall {
  constructor() {
    Object.defineProperty(this, "random", { value: EightBall.random });
  }

  generator(input) {
    if (!/\?$/.test(input)) throw "This doesn't seem to be a question.";
    if (/^when/i.test(input)) return this.generate("when");
    if (/^what/i.test(input)) return this.generate("what");
    if (/^how much/i.test(input)) return this.generate("howmuch");
    if (/^how many/i.test(input)) return this.generate("howmany");
    if (/^why/i.test(input)) return this.generate("why");
    if (/(do|are).+you.+(lie|lying)/gi.test(input)) return this.generate("doyoulie");
    return this.generate("thisElse");
  }

  generate(value) {
    const randomValues = {
      when: ["Soon™", "Maybe tomorrow.", "Maybe next year...", "Right now.", "In a few months."],
      what: ["A plane.", "What? Ask again.", "A gift.", "Nothing.", "A ring.", "I don't know, maybe something."],
      howmuch: ["A lot.", "A bit.", "A few.", "Ask me tomorrow.", "I don't know, ask a physicist.", "Nothing.", `Within ${this.random(10)} and ${this.random(1000)}L.`, `${this.random(10)}e${this.random(1000)}L.`, "2 or 3 liters, I don't remember.", "Infinity.", "1010 liters."],
      howmany: ["A lot.", "A bit.", "A few.", "Ask me tomorrow.", "I don't know, ask a physicist.", "Nothing.", `Within ${this.random(10)} and ${this.random(1000)}.`, `${this.random(10)}e${this.random(1000)}.`, "2 or 3, I don't remember.", "Infinity", "1010."],
      why: ["Maybe genetics.", "Because somebody decided it.", "For the glory of satan, of course!", "I don't know, maybe destiny.", "Because I said so.", "I have no idea.", "Harambe did nothing wrong.", "Ask the owner of this server.", "Ask again.", "To get to the other side.", "It says so in the Bible."],
      doyoulie: ["Nope.", "Nope.", "Maybe.", "Maybe.", "Most likely.", "YES!"],
      thisElse: ["Most likely.", "Nope.", "YES!", "Maybe."],
    };
    const row = randomValues[value];
    return row[Math.floor(Math.random() * row.length)];
  }

  static random(num) {
    return Math.round(Math.random() * num);
  }
}

exports.run = async (client, msg, [input]) => {
  try {
    const eBall = new EightBall();
    const output = eBall.generator(input);
    await msg.send(`🎱 Question by ${msg.author}: *${input}*\n${"```"}\n${output}${"```"}`);
  } catch (e) {
    msg.send(`Dear ${msg.author}, ${e}`);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
  cooldown: 15,
};

exports.help = {
  name: "8ball",
  description: "Skyra will read the Holy Bible to find the correct answer for your question.",
  usage: "<Question:str>",
  usageDelim: "",
  extendedHelp: [
    "I'm wondering something... uhm... Why did the chicken cross the road?",
    "",
    "Examples:",
    "&8ball Why did the chicken cross the road?",
    "❯❯ \" Maybe genetics \" (random)",
  ].join("\n"),
};
