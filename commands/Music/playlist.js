const managerMusic = require("../../utils/managerMusic");
const google = require("googleapis");

const playlist = require("util").promisify(google.youtube("v3").playlistItems.list);
const getInfoAsync = require("util").promisify(require("ytdl-core").getInfo);
const constants = require("../../utils/constants");

const key = constants.getConfig.tokens.google;

exports.run = async (client, msg, [action, ...input]) => {
    const userPlaylist = msg.author.profile.playlist;
    switch (action) {
        case "played": {
            const musicInterface = managerMusic.get(msg.guild.id);
            if (!musicInterface) throw "I could not find songs to preview, the queue is empty.";
            const urls = musicInterface.recentlyPlayed.filter(v => v);
            if (urls.length === 0) throw "I could not find songs to preview, the queue is empty.";
            const list = urls.map((url, index) => `${String(index + 1).padStart(2, 0)} : ${url}`);
            return msg.send(`Recently played songs for ${msg.guild}${"```http"}\n${list.join("\n")}${"```"}`);
        }
        case "list": {
            if (userPlaylist.length === 0) throw "you do not have a playlist.";
            const list = userPlaylist.map((url, index) => `${String(index + 1).padStart(2, 0)} : ${url}`);
            return msg.send(`Playlist for ${msg.author}${"```http"}\n${list.join("\n")}${"```"}`);
        }
        case "save": {
            if (userPlaylist.length === 10) throw "your saved playlist is full. Remove at least one song.";
            const url = input.length ? input.join(" ") : null;
            if (url === null) throw "You must specify an URL.";
            if (/^-last:\d+/.test(url)) {
                const musicInterface = managerMusic.get(msg.guild.id);
                if (!musicInterface) throw "I could not find songs to import, the queue is empty.";
                const urls = musicInterface.recentlyPlayed.filter(v => v);
                if (urls.length === 0) throw "I could not find songs to import, the queue is empty.";
                const amount = parseInt(/^-last:(\d+)/.exec(url)[1]);
                if (isNaN(amount)) throw "unexpected error, expected an integer after `-save:`";
                const toAdd = Math.min(10 - userPlaylist.length, amount);
                let added = 0;
                for (let i = 0; i < toAdd; i++) {
                    const song = musicInterface.recentlyPlayed[9 - i];
                    if (song && !userPlaylist.includes(song)) {
                        userPlaylist.push(song);
                        added++;
                    }
                }
                await msg.author.profile.update({ playlist: userPlaylist });
                return msg.send(`Successfully added ${added} songs to your playlist.`);
            } else if (/(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=/.test(url)) {
                const playlistId = url.replace(/(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=/, "");
                const { items } = await playlist({ playlistId, maxResults: 10, part: "contentDetails,snippet", auth: key }).catch((err) => { throw err; });
                const resolved = await Promise.all(items.map(item => getInfoAsync(`https://youtu.be/${item.contentDetails.videoId}`).catch(() => false)));

                const toAdd = Math.min(10 - userPlaylist.length, items.length);
                let amount = 0;
                for (let i = 0; i < toAdd; i++) {
                    if (!resolved[i]) continue;
                    userPlaylist.push(`https://youtu.be/${items[i].contentDetails.videoId}`);
                    amount++;
                }
                await msg.author.profile.update({ playlist: userPlaylist });
                return msg.send(`Successfully added ${amount} songs to your playlist.`);
            }
            throw new Error("Incorrect usage. Please review the help message for this command for further details.");
        }
        case "add": {
            if (userPlaylist.length === 10) throw "your saved playlist is full. Remove at least one song.";
            const url = input.length ? input.join(" ") : null;
            if (url === null) throw "You must specify an URL.";
            if (!/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9-_]{11}$/.test(url)) {
                throw "invalid YouTube URL, make sure you typed it correctly.";
            }
            const info = await getInfoAsync(url).catch((err) => { throw err; });
            userPlaylist.push(`https://youtu.be/${info.video_id}`);
            await msg.author.profile.update({ playlist: userPlaylist });
            return msg.send(`Successfully added <https://youtu.be/${info.video_id}> (${info.title}) to your playlist.`);
        }
        case "remove": {
            if (userPlaylist.length === 0) throw "your saved playlist is empty. Add at least one song.";
            const url = input.length ? input.join(" ") : null;
            if (url === null) throw "You must specify an URL.";
            if (!/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9-_]{11}$/.test(url)) {
                throw "invalid YouTube URL, make sure you typed it correctly.";
            }
            const index = userPlaylist.indexOf(url);
            if (index < 0) throw "you have never saved this YouTube URL, are you sure you typed the video ID correctly?";
            userPlaylist.splice(index, 1);
            await msg.author.profile.update({ playlist: userPlaylist });
            return msg.send(`Successfully removed the video <${url}> from your playlist.`);
        }
        case "clear": {
            if (userPlaylist.length === 0) throw "your saved playlist is empty. Add at least one song.";
            userPlaylist.splice(0, 10);
            await msg.author.profile.update({ playlist: [] });
            return msg.send("Successfully cleared your playlist.");
        }
        default:
            break;
    }

    return null;
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 10,
    guilds: managerMusic.guilds,
};

exports.help = {
    name: "playlist",
    description: "List, save, add, remove, or clear your personal playlist.",
    usage: "<played|list|save|add|remove|clear> [urlOrInput:string] [...]",
    usageDelim: " ",
    extendedHelp: [
        "Woo! Playlists!",
        "",
        "= Usage =",
        "Skyra, played                  :: I will show you the last 10 songs played.",
        "Skyra, list                    :: I will show you your saved playlist.",
        "Skyra, save <-last:D|PlayList> :: Save to your playlist up to 10 songs, either from the played songs, or from a YouTube playlist.",
        "Skyra, add <YouTubeURL>        :: Add a single video to your playlist.",
        "Skyra, remove <YouTubeURL>     :: Remove a single video from your playlist.",
        "Skyra, clear                   :: Prune your personal playlist.",
        "",
        "= Reminder =",
        "You can set up to 10 songs in your personal playlist.",
        "",
        "= Examples =",
        "Skyra, save -last:5",
        "❯❯ I will save the last 5 songs played from the current session.",
    ].join("\n"),
};
