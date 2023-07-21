/**
 * Created by bi on 5/10/16.
 */


var MT = function (config) {
	this.config = config;
};

MT.prototype.get = function (cmd, state) {
	// console.log('Config: ', this.config, cmd, state);
	return this.config[cmd + '-' + state];
};

module.exports = MT;
