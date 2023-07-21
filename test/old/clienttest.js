var soap = require('soap');
argLen = process.argv.length;
var className = 'Viettel9029';
var server = '127.0.0.1';
var port = 8403;
if(argLen >= 3) {
	className = process.argv[2];
}

if(argLen == 4) {
	switch (process.argv[3]) {
		case 'test':
			server = '210.211.99.116';
		break;
		case 'real':
			server = '10.58.82.131';
			
		break;
		default:
			server = '127.0.0.1';
	}
}

switch (className) {
	case 'ViettelMO':
		var url = 'http://' + server + ':' + port + '/molistener?wsdl';
		var args = {};
		args.username = 'smsviettel';
		args.password = 'smspw@321';
		args.source = '0979286704';
		args.dest = '6704';
		args.content = 'test';

		soap.createClient(url, function(err, client) {
			client.moRequest(args, function(err, result) {
				console.log(result);
			}) ;
		});
	break;
	case 'ViettelSubscriber':
		var url = 'http://' + server + ':' + port + '/subscribe?wsdl';
		console.log(url);
		var args = {};
		args.username = 'smsviettelsub';
		args.password = 'smssub@321';
		args.serviceid = 'GAME_THUDO2';
		args.msisdn = '979286704';
		args.chargetime = '20150303080808';
		args.params = 0;
		args.command = 'ct1 tandn';
		args.mode ='REAL';
	        args.amount = '10000';
		soap.createClient(url, function(err, client) {
		  client.subRequest(args, function(err, result) {
		  	if(err) console.log(err);
		  	console.log(result);
		  });
		});
	break;
	case 'ViettelResult':
		var url = 'http://' + server + ':' + port + '/receiveresult?wsdl';
		console.log(url);
		var args = {};
		args.username = 'smsviettel';
		args.password = 'smspw@321';
		args.serviceid = 'GAME_THUDO';
		args.chargetime = '20150303080808';
		args.msisdn = '979286704';
		args.params = 0;
		args.mode ='REAL';
		args.amount = '10000';

		soap.createClient(url, function(err, client) {
			client.resultRequest(args, function(err, result) {
				console.log(result);
			});
		});
	break;
	case 'ViettelContent':
		var url = 'http://' + server + ':' + port + '/getcontent?wsdl';
		console.log(url);
		var args = {};
		args.username = 'smsviettel';
		args.password = 'smspw@321';
		args.serviceid = 'GAME_THUDO';
		args.msisdn = '0979286704';
		args.params = 'CT 10000 NAP10 tandn 2sd';
		args.mode ='CHECK';
		args.amount = 10000;
		soap.createClient(url, function(err, client) {
			client.contentRequest(args, function(err, result) {
				console.log(result);
			});
		});
	break;
	case 'ViettelNotify':
		var url = 'http://' + server + ':' + port + '/notify?wsdl';
		console.log(url);
		var args = {};
		args.userName = 'smsviettel';
		args.password = 'smspw@321';

		soap.createClient(url, function(err, client) {
			client.sendNotify(args, function(err, result) {
				console.log(result);
			});
		});
	break;
}






