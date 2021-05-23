var plist = require('plist');
var fs = require('fs');
var path = require('path');
var util = require('./util');

var getPathResult;
var getPath = function(callback) {
    if (getPathResult) {
        return callback.apply(null, getPathResult);
    }

    util.find('com.apple.Safari', function(err, p) {
        getPathResult = [err, p];
        getPath(callback);
    });
};

var getVersion = function(callback) {
    getPath(function(err, p) {
        if (err) {
            return callback(err);
        }
        var pl = path.join(p, 'Contents', 'version.plist');
        try {
            var file = fs.readFileSync(pl, 'utf8');
            var data = plist.parse(file);
            callback(null, data[0].CFBundleShortVersionString);
        } catch (err) {
            callback(err);
        }
    });
};

exports.path = getPath;
exports.version = getVersion;
