var plist = require('plist');
var fs = require('fs');
var path = require('path');
var util = require('./util');
var exists = util.exists;

//Fetch all known version of Firefox on the host machine
exports.all = function(callback) {
    var installed = [],
        pending = 0,
        check = function() {
            if (!pending) {
                callback(null, installed);
            }
        };

    util.find('org.mozilla.firefox', function(err, p) {
        if (err) {
            callback(err);
        } else {
            var items = p.split('\n');
            pending = items.length;
            items.forEach(function(loc) {
                var pl = path.join(loc, 'Contents', 'Info.plist');
                exists(pl, function(y) {
                    if (y) {
                        try {
                            var file = fs.readFileSync(pl, 'utf8');
                            var data = plist.parse(file);
                            var o = {
                                version: data[0].CFBundleShortVersionString,
                                path: path.join(loc, 'Contents/MacOS/firefox-bin')
                            };
                            installed.push(o);
                        } catch (err) {
                            return callback(err);
                        }
                    }
                    pending--;
                    check();
                });
            });
        }
    });
};
