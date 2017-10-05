const _ = require("lodash");

module.exports = function SkipperFTPStream(options) {

    options = _.defaults(options, {
        path: '/',
        host: 'localhost',
        port: 21,
        username: 'root',
        password: 'root'
    });

    var adapter = {};
    adapter.rm = function (fd, cb) {
        return cb();
    };

    adapter.ls = function (dirpath, cb) {
        return cb(null, []);
    };

    adapter.read = function (fd, cb) {
        return null;
    };

    adapter.receive = function (options) {
        return null;
    };

    return adapter;
};


