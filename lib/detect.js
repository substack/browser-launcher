var spawn = require('child_process').spawn;
var merge = require('merge');
var windows = require('./windows');
var darwin = require('./darwin');

var browsers = {
    'google-chrome' : {
        name : 'chrome',
        re : /Google Chrome (\S+)/,
        type : 'chrome',
        profile : true,
    },
    'chromium-browser' : {
        name : 'chromium',
        re : /Chromium (\S+)/,
        type : 'chrome',
        profile : true,
    },
    'firefox' : {
        name : 'firefox',
        re : /Mozilla Firefox (\S+)/,
        type : 'firefox',
        profile : true,
    },
    'phantomjs' : {
        name : 'phantom',
        re : /(\S+)/,
        type : 'phantom',
        headless : true,
        profile : true,
    },
    'safari': {
    	name: 'safari',
        type: 'safari',
        profile: false
    },
    'ie': {
        windows: true,
        name: 'ie',
        type: 'ie',
        profile: false
    }
};

module.exports = function (cb) {
    var available = [],
        pending = Object.keys(browsers).length;
    Object.keys(browsers).forEach(function (name) {
        var br = browsers[name];
        check(name, function (v, p) {
            if (v) {
                available.push(merge(br, {
                    command : p || name,
                    version : v,
                }));
            }
            if (--pending === 0) cb(available);
        });
    });
};


function checkWindows (name, cb) {
	console.log('Checking:', name);
	if (windows[name]) {
	    console.log('Fetching version for', name);
	    windows[name].version(function(err, version) {
	    console.log('Version ', version, 'for', name);
            if (version) {
               windows[name].path(function(err, p) {
	    		console.log('Fetching path for', name, version, p);
                    if (err) {
                        return cb('failed to get path for ' + name);
                    }
                    cb(version, p);
               });
            } else {
               cb('failed to get version for ' + name);
            }
	    });
	} else {
   	    checkWhich(name, cb);
	}
};

function checkDarwin (name, cb) {
	if (darwin[name]) {
	    darwin[name].version(function(err, version) {
            if (version) {
                darwin[name].path(function(err, p) {
                    if (err) {
                        return cb('failed to get path for ' + name);
                    }
                    cb(version, p);
               });
            } else {
               cb('failed to get version for ' + name);
            }
	    });
	} else {
   	    checkWhich(name, cb);
	}
};

function check(name, cb) {
    switch (process.platform) {
        case 'win32':
	        checkWindows(name, cb);
            break;
        case 'darwin':
            checkDarwin(name, cb);
            break;
        default:
   	        checkWhich(name, cb);
            break;
   }
};

function checkWhich (name, cb) {
    var re = browsers[name].re;
    if (browsers[name].windows) {
	 return cb(null);
    }
    var ps = spawn(name, [ '--version' ]);
    var data = '';
    ps.stdout.on('data', function (buf) { data += buf });
    
    ps.on('exit', function (code, sig) {
        if (code !== 0) return cb(null);
        
        var m = re.exec(data);
        if (m) cb(m[1])
        else cb(data.trim())
    });
};
