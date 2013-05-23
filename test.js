var SVN = require('./lib/svn');
var util = require('util');

var trunk = new SVN(__dirname + '/test-trunk');

trunk.info(function(err, data) {
    console.log(data);
});