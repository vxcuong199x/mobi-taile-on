var soap = require('soap');
var server = '127.0.0.1';
var port = 8302;

function randomPhone() {
	var head = ['0163','0164', '0165', '0166', '0167', '0168', '0169', '096', '097', '098'];
	var tail = '';
	for(var i = 0; i < 7; i++) {
		tail = tail.toString() + Math.floor(Math.random()*9);
	}
	var headnumber = head[Math.floor(Math.random()*head.length)];
	var phone = headnumber + tail;
	return phone;
}

function randomParams() {
	var params = ['ct 10000 nap10','ct 15000 nap15','ct 20000 nap20', 'ct 30000 nap30', 'ct 50000 nap50', 'dvo 10000 nap10', 'dvo 15000 nap15', 'dvo 20000 nap20', 'dvo 30000 nap30', 'dvo 50000 nap50', 'ba 10000 nap10', 'ba 15000 nap15', 'ba 20000 nap20', 'ba 30000 nap30', 'ba 50000 nap50', 'ion 10000 nap10', 'ion 15000 nap15', 'ion 20000 nap20', 'ion 30000 nap30', 'ion 50000 nap50'];
	var random = Math.floor(Math.random()*params.length);
	var syntax = params[random] + " tandn";
	return syntax;
}
var count = 0;
var time = 300;
var countSms = 600;

function smsCall(time) {
	console.log(time);
	setTimeout(function() {
		var url = 'http://' + server + ':' + port + '/getcontent?wsdl';
		var args = {};
		args.username = 'smsviettel';
		args.password = 'smspw@321';
		args.serviceid = 'GAME_THUDO';
		args.msisdn = randomPhone();
		args.params = randomParams();
		args.mode ='CHECK';
		args.amount = args.params.match(/^.*([0-9]{5}).*$/)[1];
		soap.createClient(url, function(errcall, client) {
			client.contentRequest(args, function(err, result) {
				console.log(args.msisdn, args.params);
				if(err) console.log(err);
				console.log(result);
				if(result.return.indexOf('0') > -1) {
					console.log("_");
					args.mode = 'REAL';
					client.contentRequest(args, function(err2, result2) {
						if(err2) console.log(err2);
						count++;
						console.log(result2);
						if(count == countSms) {
							console.log("DONE SUCCESSFULLLY");
						}
					});
				}
			});
		});
	}, time);
}
smsCall(1000);
//for(var i = 0; i < countSms; i++) {
//	var randomSec = Math.floor(Math.random()*time)*1000;
//	smsCall(randomSec);
//}




