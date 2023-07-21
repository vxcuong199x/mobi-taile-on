// argLen = process.argv.length;
// console.log(process.argv);
// if(argLen >= 3) {
// 	var className = process.argv[2];

// 	var test.txt = false;
// 	if(argLen == 4) {
// 		test.txt = process.argv[3];
// 	}

// 	if(className.slice(0, 7) == 'Viettel') {
// 		var ClassHandle = require('./class/' + className + '.js')[className];	
// 		var config = require('./config/config.js').config;
// 		var server = new ClassHandle();
// 		server.startServer(className, test.txt);
// 	} else {
// 		console.log('Class not found');
// 	}
// } else {
// 	console.log('WS class not found');
// }
var ClassHandle = require('././ViettelContent.js').ViettelContent;
var config = require('./../config/config.js').config;
var server = new ClassHandle();
var className = 'ViettelContent';
var test = 'test';
server.startServer(className, test);

