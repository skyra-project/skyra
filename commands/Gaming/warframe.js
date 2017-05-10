const { sep } = require("path");
const Canvas = require("canvas");
const fsp = require("fs-extra-promise");
const wf = require("warframe-worldstate-data");
const moment = require("moment");
const sqlite = require("sqlite");

const warframeAssets = `images${sep}warframe${sep}`;

const searchDB = (query, rows) => {
  if (rows.find(r => r.oName === query)) return rows.find(r => r.oName === query);
  return false;
};

const selectFlag = (query) => {
  switch (query.toLowerCase()) {
    case "blueprint": return [0, 0, 48, 11];
    case "mod": return [0, 11, 19, 11];
    case "item": return [19, 11, 24, 11];
    case "credit": return [0, 22, 11, 11];
    case "endo": return [11, 22, 11, 11];
    case "resource": return [0, 33, 43, 11];
    case "rare": return [0, 0, 0, 0];
    default: throw new Error("Unknown type");
  }
};

const showAlerts = client => new Promise(async (resolve, reject) => {
  const res = await client.wrappers.requestJSON("http://content.warframe.com/dynamic/worldState.php");
  const allAlerts = res.Alerts;

  // GENERATE CANVAS
  const c = new Canvas(370, 99 + (91 * allAlerts.length));
  const background = new Canvas.Image();
  const alert = new Canvas.Image();
  const fcorpus = new Canvas.Image();
  const fgrineer = new Canvas.Image();
  const finfested = new Canvas.Image();
  const fsentient = new Canvas.Image();
  const flags = new Canvas.Image();
  const ctx = c.getContext("2d");

  ctx.antialias = "subpixel";
  ctx.scale(1, 1);

  // LOAD FONTS
  const NunitoSansExtraLight = new Canvas.Font("NunitoSansExtraLight", `${client.clientBaseDir}assets/fonts/NunitoSans-ExtraLight.ttf`); // eslint-disable-line no-unused-vars
  const FiraSans = new Canvas.Font("FiraSans", `${client.clientBaseDir}assets/fonts/FiraSans-Regular.ttf`); // eslint-disable-line no-unused-vars
  try {
    // FONTS
    ctx.font = "18px FiraSans";
    ctx.fillStyle = "rgb(23,23,23)";

    // DRAW THE BACKGROUND
    ctx.fillStyle = "rgb(42, 42, 42)";
    ctx.fillRect(5, 5, 360, 89 + (91 * allAlerts.length));
    background.src = await fsp.readFileAsync(`${client.constants.assets}${warframeAssets}warframebanner.png`);
    ctx.drawImage(background, 0, 0, 370, 99);
    alert.src = await fsp.readFileAsync(`${client.constants.assets}${warframeAssets}alertFull.png`);

    // DRAW THE ALERTS
    let axisY = 91;

    // FACTIONS
    fcorpus.src = await fsp.readFileAsync(`${client.constants.assets}${warframeAssets}factions${sep}Darkcorpus.png`);
    fgrineer.src = await fsp.readFileAsync(`${client.constants.assets}${warframeAssets}factions${sep}Darkgrineer.png`);
    finfested.src = await fsp.readFileAsync(`${client.constants.assets}${warframeAssets}factions${sep}Darkinfested.png`);
    fsentient.src = await fsp.readFileAsync(`${client.constants.assets}${warframeAssets}factions${sep}Darksentient.png`);
    flags.src = await fsp.readFileAsync(`${client.constants.assets}${warframeAssets}sprites${sep}flag.png`);

    // LOAD DATABASE
    await sqlite.open(`${client.constants.assets}database${sep}warframe.sqlite`);
    const rows = await sqlite.all("SELECT * FROM warframe");

    // SHOW ALL ALERTS
    for (let index = 0; index < allAlerts.length; index++) {
      const a = allAlerts[index];
      ctx.fillStyle = "rgb(57, 57, 57)";
      ctx.font = "bold 18px FiraSans";
      ctx.textAlign = "left";
      // ctx.fillRect(5, 5 + axisY, 360, 89);
      ctx.drawImage(alert, 0, axisY, 370, 99);
      const faction = wf.factions[a.MissionInfo.faction].value.toLowerCase();
      const allItems = [];

      // FACTION
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.rect(5, axisY + 5, 360, 60);
      ctx.clip();
      switch (faction) {
        case "corpus":
          ctx.drawImage(fcorpus, 295, axisY - 25, 103, 104);
          break;
        case "grineer":
          ctx.drawImage(fgrineer, 295, axisY - 25, 103, 104);
          break;
        case "infested":
          ctx.drawImage(finfested, 295, axisY - 25, 103, 104);
          break;
        case "sentient":
          ctx.drawImage(fsentient, 295, axisY - 25, 103, 104);
          break;
        default:
      }
      ctx.restore();

      // ITEMS
      const amounts = [];
      if (a.MissionInfo.missionReward.items) {
        a.MissionInfo.missionReward.items.map((i) => {
          const item = i.split("/")
            .pop()
            .split(/(?=[A-Z])/)
            .join(" ")
            .toUpperCase();
          return searchDB(item, rows) ? allItems.push(searchDB(item, rows)) : allItems.push(item);
        });
      }
      if (a.MissionInfo.missionReward.countedItems) {
        a.MissionInfo.missionReward.countedItems.map((i) => {
          const countedItems = i.ItemType.split("/").pop().split(/(?=[A-Z])/).join(" ")
            .toUpperCase();
          const thisData = searchDB(countedItems, rows) ? searchDB(countedItems, rows) : countedItems;
          allItems.push(thisData);
          return amounts.push(` x${i.ItemCount}`);
        });
      }

      // INFORMATION
      ctx.fillText(`${wf.solNodes[a.MissionInfo.location].value} ${a.MissionInfo.minEnemyLevel}-${a.MissionInfo.maxEnemyLevel}`, 10, axisY + 24);
      ctx.textAlign = "right";
      ctx.font = "italic 14px FiraSans";
      ctx.fillText(wf.missionTypes[a.MissionInfo.missionType].value, 355, axisY + 72);
      ctx.textAlign = "left";
      let axisYitem = axisY + 40;

      // CREDITS
      ctx.font = "14px FiraSans";
      ctx.drawImage(flags, 0, 22, 11, 11, 20, axisYitem - 11, 11, 11);
      ctx.fillText(a.MissionInfo.missionReward.credits, 37, axisYitem);
      axisYitem += 14;

      // ITEMS
      if (allItems[0]) {
        allItems.forEach((thisItem) => {
        // FLAGS
          let offset = 0;
          let thisAmount = "";
          if (thisItem.type) {
            const thisFlag = selectFlag(thisItem.type);
            offset += thisFlag[2] + 5;
            ctx.drawImage(flags, thisFlag[0], thisFlag[1], thisFlag[2], thisFlag[3], 20, axisYitem - 11, thisFlag[2], thisFlag[3]);
            thisAmount = amounts[0] ? amounts[0] : "";
            const thisType = thisItem.type2 ? ` [${thisItem.type2}] ` : "";
            ctx.fillText(thisItem.item + thisType + thisAmount, 20 + offset, axisYitem);
          } else { ctx.fillText(thisItem, 20 + offset, axisYitem); }
          axisYitem += 14;
        });
      }

      // TIME
      ctx.font = "bold 14px FiraSans";
      ctx.textAlign = "center";
      ctx.fillText(moment.duration(a.Expiry.$date.$numberLong - new Date()).format("H [hours,] m [mins,] s [secs]"), 185, axisY + 91);
      axisY += 91;
    }
    resolve(c);
  } catch (e) {
    reject(e);
  }
});

exports.run = async (client, msg) => {
  const output = await showAlerts(client);
  await msg.channel.sendFile(output.toBuffer(), "warframe.png");
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 30,
};

exports.help = {
  name: "warframe",
  description: "Get info from Warframe.",
  usage: "",
  usageDelim: "",
  extendedHelp: [
    "Welcome here Tenno! Do you want to check what's going on?",
    "",
    "Usage:",
    "&warframe alerts|version|boss",
    "",
    " ❯ Alerts: Shows you all available alerts. (You can just omit this keyword)",
    " ❯ Version: Shows you the path notes.",
    " ❯ Boss: Shows you a list of bosses (they aren't sorted).",
    "",
    "Examples:",
    "&warframe",
    "❯❯ I show you all alerts.",
  ].join("\n"),
};
