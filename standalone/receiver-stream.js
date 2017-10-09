var WritableStream = require('stream').Writable;
var _ = require('lodash');
var debug = require('debug')('skipper-ftp');

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
            debug(err);
        });

        __newFile.once('error', function (err) {
            // console.log('ERROR ON file read stream in receiver (%s) ::', __newFile.filename, err);
            // TODO: the upload has been cancelled, so we need to stop writing
            // all buffered bytes, then call gc() to remove the parts of the file that WERE written.
            // (caveat: may not need to actually call gc()-- need to see how this is implemented
            // in the underlying knox-mpu module)
            //
            // Skipper core should gc() for us.
            debug(err);
        });

        // file name before passing to transform
        options.filename = __newFile.fd;

        // extra meta data
        __newFile.extra = {};

        // Create a new write stream to parse File stream  to FTP
        var outs__ = require('./ftp-parser')(options);


        // When the file is done writing, call the callback
        outs__.on('finish', function successfullyWroteFile() {
            __newFile.byteCount = outs__.bodyLength; // this is for skipper meta data of the file

            // Indicate that a file was persisted.
            receiver__.emit('writefile', __newFile);

            done();
        });
        outs__.on('error', function (err) {
            debug(err);
            __newFile.extra.error = err; //in case it was finished with error
        });

        outs__.on('E_EXCEEDS_UPLOAD_LIMIT', function (err) {
            done(err)
        });


        // Finally pipe out to FTP parser
        __newFile.pipe(outs__);

    };

    return receiver__;
};
