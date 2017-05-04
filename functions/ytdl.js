const ytdl = require("ytdl-core");
const fs = require("fs-extra-promise");

class YoutubeDownloader {
  constructor() {
    this.getInfo = YoutubeDownloader.getInfo;
    this.download = YoutubeDownloader.download;
  }

  static getInfo(url) {
    return new Promise((resolve, reject) => {
      ytdl.getInfo(url, (err, info) => {
        if (err) reject(err);
        else resolve(info);
      });
    });
  }

  static download(url, typeFormat, dir, filename) {
    return new Promise((resolve, reject) => {
      ytdl(url, { filter(format) { return format.container === typeFormat; } })
        .pipe(fs.createWriteStream(`${dir}${filename}`))
        .on("error", err => reject(err))
        .on("finish", () => resolve());
    });
  }
}

exports.init = (client) => { client.ytdl = YoutubeDownloader; };
