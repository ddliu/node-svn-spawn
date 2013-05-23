'use strict';

var spawn = require('child_process').spawn;
var util = require('util');
var xml2js = require('xml2js');
var async = require('async');

function mergeOptions (base) {
    var options = base,
        k;

    for (var i = 1; i < arguments.length; i++ ) {
        if (arguments[i] !== undefined && arguments[i] !== null) {
            for (var k in arguments[i]) {
                options[k] = arguments[i][k];
            }
        }
    }

    return options;
}

function checkSuccess (outputData, code, errorData) {
    return code === 0 && errorData === '';
}

function joinCmdParams() {
    var result = [];
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined && arguments[i] !== null) {
            if (util.isArray(arguments[i])) {
                result = result.concat(arguments[i]);
            }
            else {
                result.push(arguments[i]);
            }
        }
    }

    return result;
}

var Client = function(path, options) {
    var defaultOptions = {
        program: 'svn',
        output: true,
        captureError: false,
        captureOutput: false
    };
    this.path = path;

    this.sessionOptions = {};
    this.options = mergeOptions(defaultOptions, options);
};

/*
    Options helper
 */

Client.prototype.getOption = function(key, defaultValue) {
    // get all
    if (arguments.length === 0) {
        return mergeOptions({}, this.options, this.sessionOptions);
    }

    if (key in this.sessionOptions) {
        return this.sessionOptions[key];
    }
    if (key in this.options) {
        return this.options[key];
    }

    return defaultValue;
};

Client.prototype.session = function(options) {
    if (arguments.length > 1) {
        options = {};
        options[arguments[0]] = arguments[1]
    }

    mergeOptions(this.sessionOptions, options);

    return this;
};


/*
    SVN commands
 */

Client.prototype.checkout = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }
    params = joinCmdParams('checkout', params);

    this.cmd(params, callback);
};

Client.prototype.update = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }
    params = joinCmdParams('update', params);

    this.cmd(params, callback);
};

Client.prototype.commit = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }
    params = joinCmdParams(['commit', '-m'], params);

    this.cmd(params, callback);
};

Client.prototype.add = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }
    params = joinCmdParams('add', params);

    this.cmd(params, callback);
};

Client.prototype.del = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }
    params = joinCmdParams('delete', params);

    this.cmd(params, callback);
};

Client.prototype.info = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }

    params = joinCmdParams('info', params);
    
    this.cmd(params, callback);
};

/**
 * svn info with parsed info in callback
 * @param  {Mixed}   params
 * @param  {Function} callback
 */
Client.prototype.getInfo = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }
    var self = this;

    params = joinCmdParams(['info', '--xml'], params),
    
    async.waterfall([
        function(callback) {
            self.session('output', false).cmd(params, callback);
        },
        function(data, callback) {
            xml2js.parseString(data, 
                {
                    explicitRoot: false, 
                    explicitArray: false
                },
                callback
            );
        },
    ], function(err, data) {
        if (callback) {
            if (err) {
                callback(err);
            }
            else {
                callback(err, data.entry);
            }
        }
    });
};

Client.prototype.status = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }

    params = joinCmdParams('status', params);
    
    this.cmd(params, callback);
};

/**
 * svn status with parsed info in callback
 *
 * @see status list https://github.com/apache/subversion/blob/trunk/subversion/svn/schema/status.rnc
 * @param  {Mixed}   params
 * @param  {Function} callback
 */
Client.prototype.getStatus = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }
    var self = this;

    params = joinCmdParams(['status', '--xml'], params);

    async.waterfall([
        function(callback) {
            self.session('output', false).cmd(params, callback);
        },
        function(data, callback) {
            xml2js.parseString(data, 
                {
                    explicitRoot: false,
                    explicitArray: false
                },
                callback
            );
        }
    ], function(err, data) {
        if (callback) {
            if (err) {
                callback(err);
            }
            else {
                var list = [];
                if ('target' in data) {
                    data = data.target;
                    if ('entry' in data) {
                        if (util.isArray(data.entry)) {
                            for (var i = 0; i < data.entry.length; i++) {
                                list.push(data.entry[i]);
                            }
                        } else {
                            list.push(data.entry);
                        }
                    }
                }
                callback(null, list);
            }
        }
    });
};

Client.prototype.log = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }

    params = joinCmdParams('log', params);
    this.cmd(params, callback);
};

/**
 * svn log with parsed info in callback
 * sample result:
 * <code>
 * [ 
 * { '$': { revision: '1' },
 *   author: 'dong',
 *   date: '2013-05-21T10:23:35.427701Z',
 *   msg: 'tt' 
 * } ...
 * ]
 * </code>
 * @param  {Mixed}   params
 * @param  {Function} callback
 */
Client.prototype.getLog = function(params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = null;
    }

    var self = this;

    params = joinCmdParams(['log', '--xml'], params);

    async.waterfall([
        function(callback) {
            self.session('output', false).cmd(params, callback);
        }, 
        function(data, callback) {
            xml2js.parseString(data, 
                {
                    explicitRoot: false,
                    explicitArray: false
                },
                callback
            );
        }
    ], function(err, data) {
        if (callback) {
            if (err) {
                callback(err);
            }
            else {
                var list = [];
                if (util.isArray(data)) {
                    for (var i = 0; i < data.length; i++) {
                        list.push(data[i].logentry);
                    }
                }
                else if('logentry' in data) {
                    list.push(data.logentry);
                }
                callback(null, list);
            }
        }
    });
};

/**
 * Add all local changes to for commit
 * 
 * @param  {Object}   options
 *         - status
 * @param  {Function} callback
 */
Client.prototype.addLocal = function(options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {
            status: null
        }
    }

    options = mergeOptions({
        status: null
    }, options);

    var self = this;

    async.waterfall([
        function(callback) {
            self.status(callback);
        },
        function(data, callback) {
            // do not run in parallel, or svn might be locked
            async.eachSeries(data, function(info, callback) {
                var path = info.$.path,
                    status = info['wc-status'].$.item;

                if (options.status === null || options.status.indexOf(status) !== -1) {
                    // add
                    if (['none', 'unversioned'].indexOf(status) !== -1) {
                        self.add(path, function(err) {
                            callback(err);
                        });
                    }
                    // delete
                    else if(['missing'].indexOf(status) !== -1) {
                        self.del(path, function(err) {
                            callback(err);
                        });
                    }
                    else {
                        callback(null);
                    }
                }
                else {
                    callback(null);
                }
            }, function(err) {
                callback(err);
            });
        }
    ], function(err) {
        callback && callback(err);
    });
};

Client.prototype.addLocalUnversioned = function(options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {
        };
    }
    else if(options === undefined || options === null){
        options = {

        }
    }
    options.status = 'unversioned';
    this.addLocal(options, callback);
};

/**
 * Run svn command with callback
 * @param  {Mixed}   cmd
 * @param  {Function} callback
 */
Client.prototype.cmd = function(cmd, callback) {
    if (!util.isArray(cmd)) {
        cmd = [cmd];
    }

    var options = this.getOption(),
        s = spawn(options.program, cmd, 
            {
                cwd: this.path
            }
        ),
        outputData = [],
        errorData = [];

    s.on('error', function(err) {
        callback && callback(err);
    });

    s.on('exit', function(code, signal) {
        var check;

        if ('check' in options && typeof options.check === 'function') {
            check = options.check;
        }
        else {
            check = checkSuccess;
        }

        outputData = outputData.join('');
        errorData = errorData.join('');

        // success
        if (check(outputData, code, errorData)) {
            callback && callback(null, outputData);
        }
        else {
            var e = new Error(errorData);
            e.code = code;
            e.output = outputData;
            callback && callback(e);
        }
    });
    // s.on('close', function(code, signal) {

    // });
    // s.on('disconnect', function() {

    // });
    // s.on('message', function() {

    // });
    s.stdout.on('data', function(data) {
        if (options.output) {
            process.stdout.write(data);
        }
        outputData.push(data);
    });
    s.stderr.on('data', function(data) {
        if (options.output) {
            process.stderr.write(data);
        }
        errorData.push(data);
    });

    this.sessionOptions = {};
};

module.exports = Client;