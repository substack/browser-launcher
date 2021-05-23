var launcher = require('../index.js');
launcher.detect(function (available) {
    console.log('# available browsers:');
    console.dir(available);
});
