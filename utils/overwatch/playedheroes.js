const { join, resolve } = require("path");
const Canvas = require("canvas");

Canvas.registerFont(resolve(join(__dirname, "../../assets/fonts/koverwatch.ttf")), { family: "Overwatch" });

const colours = {
  Genji: "84fe01",
  Widowmaker: "6f6fae",
  Pharah: "1b65c6",
  Junkrat: "d39308",
  Hanzo: "938848",
  Tracer: "f8911b",
  McCree: "8d3939",
  "D.Va": "ff7fd1",
  "Soldier: 76": "5870b6",
  Lúcio: "8bec22",
  Roadhog: "c19477",
  Zarya: "f571a8",
  Ana: "ccc2ae",
  Bastion: "6e994d",
  Reaper: "272725",
  Mercy: "ffe16c",
  Torbjörn: "ff6200",
  Reinhardt: "aa958e",
  Symmetra: "5cecff",
  Mei: "9adbf4",
  Sombra: "751b9c",
  Winston: "4c505c",
  Zenyatta: "c79c00",
  Orisa: "dc9a00",
};

const roundRect = (ctx, x, y, width, height, radius = 5) => {
  radius = { tl: radius, tr: radius, br: radius, bl: radius };

  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo((x + width) - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, (y + height) - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, (x + width) - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, (y + height) - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
};

module.exports = async (profile) => {
  const canvas = new Canvas(400, 420);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgb(64, 82, 117)";
  ctx.fillRect(0, 0, 400, 420);
  ctx.shadowColor = "rgba(23, 23, 23, 0.3)";
  const heroes = Object.entries(profile.quickplay.playedHeroes);
  await Promise.all(heroes.slice(0, 10).map(([hero, { percent, data }], index) => new Promise((res) => {
    ctx.font = "23px Overwatch";
    ctx.textAlign = "left";
    const offsetY = (index * 37) + 45;
    ctx.fillStyle = "rgba(24, 34, 62, 0.7)";
    roundRect(ctx, 10, offsetY, 380, 32, 6);
    ctx.fill();
    ctx.fillStyle = `#${colours[hero]}`;
    roundRect(ctx, 12, 2 + offsetY, 376 * (percent / 100), 28, 6);
    ctx.fill();
    ctx.fillStyle = "rgb(240, 237, 242)";
    ctx.save();
    ctx.transform(1, 0, -0.3, 1, 20 + (index * 11), 0);
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(hero.toUpperCase(), 20, 24 + offsetY);
    ctx.textAlign = "right";
    ctx.fillText(data, 380, 25 + offsetY);
    ctx.restore();
    res();
  })));

  return canvas.toBuffer();
};
