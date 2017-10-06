var WritableStream = require('stream').Writable;
var _ = require('lodash');


/**
 * A simple receiver for Skipper that writes Upstreams to
 * FTP module
 *
 * Includes a garbage-collection mechanism for failed
 * uploads.
 *
 * @param  {Object} options
 * @param adapter
 * @return {Stream.Writable}
 */
module.exports = function buildFTPParserReceiverStream(options, adapter) {

    var receiver__ = WritableStream({objectMode: true});

    receiver__._files = [];

    // This `_write` method is invoked each time a new file is received
    // from the Readable stream (Upstream) which is pumping file streams
    // into this receiver.  (filename === `__newFile.filename`).
    receiver__._write = function onFile(__newFile, encoding, done) {

        receiver__.once('error', function (err) {
            // console.log('ERROR ON RECEIVER__ ::',err);
            done(err);
        });

        // Error reading from the file stream
        __newFile.on('error', function (err) {
            receiver__.emit('error', err);
        });

        // file name before passing to transform
        options.filename = __newFile.filename || __newFile.fd;
        // Create a new write stream to parse File stream  to FTP
        var outs__ = require('./ftp-parser')(options);


        // When the file is done writing, call the callback
        outs__.on('finish', function successfullyWroteFile() {
            done();
        });
        outs__.on('error', function (err) {
            receiver__.emit('error', err);
        });


        // Finally pipe out to FTP parser
        __newFile.pipe(outs__);

    };

    return receiver__;
};
