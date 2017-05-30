exports.removeEmpty = (lines) => {
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length) break;
    start++;
  }
  return lines.slice(start);
};

exports.lowerIndentation = (lines) => {
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
};

exports.sliceIndents = (lines, length) => {
  const output = [];
  for (let i = 0; i < lines.length; i++) output.push(lines[i].slice(length));
  return output;
};

exports.indents = (input) => {
  input = input[0].split("\n");
  const lines = this.removeEmpty(input);
  const length = this.lowerIndentation(lines);
  const sliced = this.sliceIndents(lines, length);
  return sliced.join("\n");
};

exports.inline = (input) => {
  input = input[0].split("\n");
  const lines = this.removeEmpty(input);
  const length = this.lowerIndentation(lines);
  const sliced = this.sliceIndents(lines, length);
  return sliced.join(" ");
};
