var plist = require('plist');
var fs = require('fs');
var path = require('path');
var util = require('./util.js');
var exists = util.exists;

var getPathResult;
function getPath(callback) {
    if (getPathResult) {
        return callback.apply(null, getPathResult);
    }

    util.find('com.google.Chrome', function(err, p) {
        getPathResult = [err, p];
        getPath(callback);
    });
}

function getVersion(callback) {
    getPath(function(err, p) {
        if (err) {
            return callback(err);
        }
        var pl = path.join(p, 'Contents', 'Info.plist');
        exists(pl, function(y) {
            if (y) {
                try {
                    var file = fs.readFileSync(pl, 'utf8');
                    var data = plist.parse(file);
                    callback(null, data[0].KSVersion);
                } catch (err) {
                    callback(err);
                }
            } else {
                callback('not installed');
            }
        });
    });
}

exports.path = getPath;
exports.version = getVersion;
