var exec = require('child_process').exec;
var plist = require('plist');
var path = require('path');

var currentPath;
var pathQuery = 'mdfind "kMDItemDisplayName==Firefox&&kMDItemKind==Application"';

var getPath = function(callback) {
    if (currentPath) {
        return callback(null, currentPath);
    }

    exec(pathQuery, function (err, stdout) {
        currentPath = path.join(stdout.trim(), 'Contents', 'MacOS', 'firefox');
        callback(err, currentPath);
    });
};

var getVersion = function(callback) {
    getPath(function(err, p) {
        var pl = path.join(p, '../../', 'Info.plist');
        plist.parseFile(pl, function(err, data) {
            callback(err, data[0].CFBundleGetInfoString);
        });
    });
};

exports.path = getPath;
exports.version = getVersion;
