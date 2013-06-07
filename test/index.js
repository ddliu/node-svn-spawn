var Client = require('../');
var fs = require('fs');

var workingPath = __dirname + '/src/trunk';

var client = new Client({
    cwd: workingPath
});

module.exports = {
    'test checkout': function(test) {
        var checkoutPath = __dirname + '/src/checkout';
        var client = new Client({
            cwd: checkoutPath
        });

        client.checkout('file:///home/dong/projects/test/test-svn-trunk', function(err, data) {
            test.equals(err, null);
            test.done();
        });
    },
    'test info': function(test) {
        client.getInfo(function(err, data) {
            test.equals(err, null);
            test.ok('url' in data);
            test.done();
        });
    },
    'test update': function(test) {
        client.update(function(err, data) {
            test.equals(err, null);
            test.ok(data.indexOf('At revision') !== -1);
            test.done();
        });
    },
    'test status': function(test) {
        client.getStatus(function(err, data) {
            test.equals(err, null);
            // test.equals(data.length, 0);
            test.done();
        });
    },
    'test log': function(test) {
        client.getLog(function(err, data) {
            test.equals(err, null);
            test.ok('author' in data[0]);
            test.done();
        });
    },
    'test add': function(test) {
        fs.writeFileSync(workingPath + '/a.txt', new Date().toString());

        client.addLocal(function(err, data) {
            test.equals(err, null);
            test.done();
        });
    },
    'test delete': function(test) {
        // TODO
        
        test.done();
    },
    'test commit': function(test) {
        fs.writeFileSync(workingPath + '/a.txt', new Date().toString());

        client.addLocal(function(err, data) {
            test.equals(err, null);
            client.commit('test commit', function(err, data) {
                test.equals(err, null);
                test.done();
            });
        });
    },
    'test update': function(test) {
        client.update(function(err, data) {
            test.equals(err, null);
            test.done();
        });
    }
};