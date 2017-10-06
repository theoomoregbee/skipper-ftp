var stream = require('stream');
var util = require('util');
var Client = require('ftp');

module.exports = function (options) {
    return new Parser(options);
};


function Parser(options) {
    this.options = options;
    // init Transform
    stream.Transform.call(this, options);
}

util.inherits(Parser, stream.Transform);

console.log(Parser.emit);

Parser.prototype._transform = function (chunk, enc, cb) {
    var self = this;
    this.__upload(chunk, function (err) {
        if (err) return self.emit('error', err);

        return cb();
    });

};

Parser.prototype._flush = function (callback) {
    return callback();
};

/**
 * this is used to perform our actual uploading of data to ftp server
 * @param chunk
 * @param cb
 * @private
 */
Parser.prototype.__upload = function (chunk, cb) {
    var FTP = {
        user: this.options.username,
        password: this.options.password,
        host: this.options.host,
        path: this.options.path
    };


    var c = new Client();
    c.on('ready', function () {
        c.put(chunk, FTP.path + '/' + this.options.filename, function (err) {
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
    c.connect({
        host: FTP.host,
        user: FTP.user,
        password: FTP.password
    });
};