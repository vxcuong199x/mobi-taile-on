/**
 * Created by bi on 5/9/16.
 */

var sms = module.exports;
var utils = require('./utils');
var entry = require('../entry');

sms.onCommand = function (service, opts, cb) {
	var func = entry.map[service];
	if (typeof entry[func] === 'function') {
		entry[func](opts, cb);
	} else {
		utils.invokeCallback(cb, new Error('Can not find service: ' + service));
	}
};
