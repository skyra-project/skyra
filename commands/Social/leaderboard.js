const { fetchAll: fetchGlobal } = require("../../utils/managerSocialGlobal");
const { fetchAll: fetchLocal } = require("../../utils/managerSocialLocal");

const titles = {
    global: {
        title: "🌐 Global Score Leaderboards",
        position: "Your global placing position: ",
    },
    local: {
        title: "🏡 Local Score Leaderboards",
        position: "Your local placing position: ",
    },
    money: {
        title: "💸 Global Money Leaderboards",
        position: "Your global placing position: ",
    },
};

exports.run = async (client, msg, [type = "local", index = 0]) => {
    let list;
    let mapedList;
    switch (type.toLowerCase()) {
        case "global":
            list = fetchGlobal()
        .filter(profile => profile.points > 0)
        .sort((a, b) => (a.points < b.points ? 1 : -1));
            mapedList = list.map(l => l.id);
            break;
        case "money":
            list = fetchGlobal()
        .filter(profile => profile.money > 0)
        .sort((a, b) => (a.money < b.money ? 1 : -1));
            mapedList = list.map(l => l.id);
            break;
        case "local":
            list = fetchLocal().get(msg.guild.id)
        .sort((a, b) => (a.score < b.score ? 1 : -1));
            mapedList = list.map(l => l.id);
  // no default
    }
    const shortList = list.array().splice(index * 10, 10);
    if (!shortList[0]) throw "I think you went to the end of the world.";
    const spacer = "\u200B  ".repeat(8);
    let position;
    const send = [];
    for (let ind = 0; ind < shortList.length; ind++) {
        if (type === "global") {
            send.push([`**${(ind + (index * 10)) + 1} ❯❯ ${client.users.get(shortList[ind].id) ? client.users.get(shortList[ind].id).username : `User not found. (${shortList[ind].id})`}**`,
                `${spacer}Points: *${shortList[ind].points}*`].join("\n"));
            position = mapedList.indexOf(msg.author.id) + 1;
        } else if (type === "local") {
            send.push([`**${(ind + (index * 10)) + 1} ❯❯ ${msg.guild.members.get(shortList[ind].id) ? msg.guild.members.get(shortList[ind].id).user.username : `User not found. (${shortList[ind].id})`}**`,
                `${spacer}Points: *${shortList[ind].score}*`].join("\n"));
            position = mapedList.indexOf(msg.author.id) + 1;
        } else if (type === "money") {
            send.push([`**${(ind + (index * 10)) + 1} ❯❯ ${client.users.get(shortList[ind].id) ? client.users.get(shortList[ind].id).username : `User not found. (${shortList[ind].id})`}**`,
                `${spacer}Balance: *${shortList[ind].money}*`].join("\n"));
            position = mapedList.indexOf(msg.author.id) + 1;
        }
    }
    const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setTitle(titles[type].title)
    .setDescription(send.join("\n"))
    .setFooter(titles[type].position + position);
    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: ["lb", "top"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 1,
    cooldown: 15,
};

exports.help = {
    name: "leaderboard",
    description: "Check the leaderboards.",
    usage: "[global|local|money] [index:int]",
    usageDelim: " ",
    extendedHelp: [
        "Leaderboards! Will you be the 1#?",
        "",
        "By default, when you do \"Skyra, top\", I'll show you the LOCAL leaderboards, however, you can get the top for global (points) and money (being the richest users the first, and global).",
        "You can also choose the offset using the index parameter. One trick, if you want to see who is in the rank 113, you just do \"Skyra, top local 11\".",
    ].join("\n"),
};
