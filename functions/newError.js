module.exports = (error, code) => {
  if (error.status) {
    this.statusCode = error.response.res.statusCode;
    this.statusMessage = error.response.res.statusMessage;
    this.code = error.response.body.code;
    this.message = error.response.body.message;
    return this;
  }
  this.code = code || null;
  this.message = error;
  this.stack = error.stack || null;
  return this;
};
