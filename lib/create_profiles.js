var path = require('path');
var spawn = require('child_process').spawn;
var mkdirp = require('mkdirp');

module.exports = function (avail, configDir, cb) {
    var pending = avail.length;
    if (pending === 0) cb();

    avail.forEach(function (br) {
        if (br.type === 'firefox' && br.profile) {
            createFirefox(br.command, configDir, function (err, profile) {
                if (err) return cb(err);
                br.profile = profile;
                if (--pending === 0) cb();
            });
        }
        else if (br.profile) {
            var dir = br.profile = makeDir(br.name, br.version);
            mkdirp(dir).then(function (made) {
                if (--pending === 0) cb();
            }).catch(function(err) {
                cb(err)
            });
        }
        else if (--pending === 0) cb()
    });

    function makeDir (name, v) {
        var d = name + '-' + v + '_' + Math.random().toString(16).slice(2);
        return path.join(configDir, d);
    }
};

function createFirefox (name, configDir, cb) {
    var profileName = 'browser-launcher-' + Math.random().toString(16).slice(2);
    var profilePath = path.join(configDir, 'firefox-' + profileName)
    var args = [ '--no-remote', '-CreateProfile', profileName + ' ' + profilePath];
    var ps = spawn(name, args);

    var data = '';
    ps.stdout.on('data', function (buf) { data += buf });
    ps.stderr.on('data', function (buf) { data += buf });

    ps.on('exit', function (code) {
        if (code !== 0) {
            return cb(name + ' ' + args.join(' ')
                + ' exited with code ' + code + ': ' + data
            );
        }

        else cb(null, { name : profileName, file : profilePath })
    });
}
