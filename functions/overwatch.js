const cheerio = require("cheerio");
const snekfetch = require("snekfetch");

exports.fetch = async (url) => {
    const data = { overview: {} };
    data.quickplay = { highlight: {}, playedHeroes: {}, stats: {} };
    data.competitive = { highlight: {}, playedHeroes: {}, stats: {} };
    data.url = url;
    const { text } = await snekfetch.get(url);
    const $ = cheerio.load(text);

    const masthead = $("#overview-section > div.u-relative > div.u-max-width-container > div.column > div.masthead");
    const mastheadPlayer = masthead.children("div.masthead-player");
    const mastheadProgression = masthead.children("div.masthead-player-progression");

    data.overview.profile = {
        name: mastheadPlayer.children("h1.header-masthead").text(),
        avatar: mastheadPlayer.children("img.player-portrait").attr("src"),
        level: parseInt(mastheadProgression.children("div.player-level").children("div.u-vertical-center").text()),
        portrait: /.+\((.+)\)/.exec(mastheadProgression.children("div.player-level").attr("style"))[1],
        stars: mastheadProgression.children("div.player-level").has("div.player-rank").length
        ? /.+\((.+)\)/.exec(mastheadProgression.children("div.player-level").children("div.player-rank").attr("style"))[1]
        : null,
    };

    if (mastheadProgression.has("div.competitive-rank").length > 0) {
        data.overview.competitiveRank = {
            image: mastheadProgression.children("div.competitive-rank").children("img").attr("src"),
            rank: parseInt(mastheadProgression.children("div.competitive-rank").children("div").text()),
        };
    } else {
        data.overview.competitiveRank = {
            image: null,
            rank: null,
        };
    }

    const HeroScrapper = (type, thisData) => thisData.each((i, elem) => {
        const hero = $(elem).children("div.bar-container").children("div.bar-text").children("div.title");
        const time = $(elem).children("div.bar-container").children("div.bar-text").children("div.description");
        data[type].playedHeroes[hero.text()] = {
            percent: Math.floor((parseFloat($(elem).attr("data-overwatch-progress-percent")) * 100)),
            data: time.text(),
        };
    });

    HeroScrapper("quickplay", $("#quickplay > section.hero-comparison-section").children("div").children("div.progress-category").first()
    .children("div"));

    HeroScrapper("competitive", $("#competitive > section.hero-comparison-section").children("div").children("div.progress-category").first()
    .children("div"));

    $("#quickplay > section.highlights-section > div > ul.row > li").each((i, elem) => {
        const thisData = $(elem).children("div.card").children("div.card-content");
        data.quickplay.highlight[thisData.children("p.card-copy").text()] = thisData.children("h3.card-heading").text();
    });

    $("#competitive > section.highlights-section > div > ul.row > li").each((i, elem) => {
        const thisData = $(elem).children("div.card").children("div.card-content");
        data.competitive.highlight[thisData.children("p.card-copy").text()] = thisData.children("h3.card-heading").text();
    });

    $("#quickplay > section.career-stats-section > div > div.row").first().children("div.column").each((i, self) => {
        const div = $(self).children("div").children("table");
        const amount = div.children("tbody").children("tr").get().length;
        const title = div.children("thead").children("tr").get(0).children[0].children[1].children[0].data;
        data.quickplay.stats[title] = {};
        for (let index = 0; index < amount; index++) {
            const subprop = div.children("tbody").children("tr").get(index).children[0].children[0].data;
            const value = div.children("tbody").children("tr").get(index).children[1].children[0].data;
            data.quickplay.stats[title][subprop] = value;
        }
    });

    $("#competitive > section.career-stats-section > div > div.row").first().children("div.column").each((i, self) => {
        const div = $(self).children("div").children("table");
        const amount = div.children("tbody").children("tr").get().length;
        const title = div.children("thead").children("tr").get(0).children[0].children[1].children[0].data;
        data.competitive.stats[title] = {};
        for (let index = 0; index < amount; index++) {
            const subprop = div.children("tbody").children("tr").get(index).children[0].children[0].data;
            const value = div.children("tbody").children("tr").get(index).children[1].children[0].data;
            data.competitive.stats[title][subprop] = value;
        }
    });

    await this.save(data);
    return data;
};

exports.save = (data) => {
    const id = data.url.replace("https://playoverwatch.com/en-us/career/", "").replace(/\//g, "-");
    data.time = Date.now();
    return this.provider.create("overwatch", id, data);
};

exports.get = async (url) => {
    const id = url.replace("https://playoverwatch.com/en-us/career/", "").replace(/\//g, "-");
    const cache = await this.provider.get("overwatch", id);
    if (!cache || cache.time + 86400000 < Date.now()) return this.fetch(url);
    return cache;
};

exports.init = client => (this.provider = client.providers.get("json"));
