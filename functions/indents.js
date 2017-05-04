class StripIndents {
  constructor() {
    this.strip = StripIndents.strip;
  }

  static removeEmpty(lines) {
    let start = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].length) start++;
      else break;
    }
    return lines.slice(start);
  }

  static lowerIndentation(lines) {
    let lower;
    let length;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length) {
        const spaces = lines[i].match(/ /g);
        length = spaces ? spaces.length : 0;
        if (lower === undefined || lower > length) lower = length;
      }
    }
    return lower || 0;
  }

  static sliceIndents(lines, length) {
    const output = [];
    for (let i = 0; i < lines.length; i++) {
      output.push(lines[i].slice(length));
    }
    return output;
  }

  static strip(input) {
    input = input[0].split("\n");
    const lines = StripIndents.removeEmpty(input);
    const length = StripIndents.lowerIndentation(lines);
    const sliced = StripIndents.sliceIndents(lines, length);
    return sliced.join("\n");
  }

  static inline(input) {
    input = input[0].split("\n");
    const lines = StripIndents.removeEmpty(input);
    const length = StripIndents.lowerIndentation(lines);
    const sliced = StripIndents.sliceIndents(lines, length);
    return sliced.join(" ");
  }
}

exports.init = (client) => {
  client.indents = new StripIndents().strip;
  client.inline = new StripIndents().inline;
};
