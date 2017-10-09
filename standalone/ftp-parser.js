var util = require('util');
var Client = require('ftp');
var FlushWritable = require('flushwritable');

module.exports = function (options) {
    return new Parser(options);
};


function Parser(options) {
    this.options = options;

    // this is used to handle each chunk from our transform
    this.bodyParts = [];
    this.bodyLength = 0;

    // init Transform
    FlushWritable.call(this, options);
}

util.inherits(Parser, FlushWritable);

Parser.prototype._write = function (chunk, enc, cb) {
    // send this to our body parts
    this.bodyParts.push(chunk);
    this.bodyLength += chunk.length;

    // check for maxBytes allowed for upload, as we get the chunks so we don't waste time to gather all chunk before checking
    if (this.bodyLength > this.options.maxBytes) {
        var maxUploadError = new Error('Max upload size exceeded.');
        maxUploadError.code = 'E_EXCEEDS_UPLOAD_LIMIT';
        this.emit('E_EXCEEDS_UPLOAD_LIMIT', maxUploadError);
        return cb(maxUploadError);
    }

    cb();
};

Parser.prototype._flush = function (callback) {

    // finally we merge each chunk together and save it
    var body = Buffer.alloc(this.bodyLength);
    var bodyPos = 0;
    for (var i = 0; i < this.bodyParts.length; i++) {
        this.bodyParts[i].copy(body, bodyPos, 0, this.bodyParts[i].length);
        bodyPos += this.bodyParts[i].length;
    }

    var self = this;
    this.__upload(body, function (err) {
        if (err) {
            self.emit('error', err);
        }

        return callback();
    });
};

/**
 * this is used to perform our actual uploading of data to ftp server
 * @param chunk
 * @param cb
 * @private
 */
Parser.prototype.__upload = function (chunk, cb) {

    var self = this;
    var c = new Client();
    c.on('ready', function () {
        c.put(chunk, self.options.path + '/' + self.options.filename, function (err) {
            if (err) cb(err);
            c.end();
        });
    });


    c.on('end', function () {
        cb();
    });

    c.on('error', function (error) {
        cb(error);
    });

    // connect to localhost:21 as anonymous
    c.connect(self.options);
};