/**
 * Created by Bi on 3/07/16.
 */

var moment = require('moment');
var md5 = require('md5');
var utils = module.exports;
var fs = require('fs');

/**
 * Check and invoke callback function
 * @param: cb
 */

utils.invokeCallback = function (cb) {
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---invokeCallback--arguments-', arguments);
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---invokeCallback--arguments 0-', Array.prototype.slice.call(arguments, 0));
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---invokeCallback--arguments 1-', Array.prototype.slice.call(arguments, 1));
  
  var args = Array.prototype.slice.call(arguments, 1);
  if (!!cb && typeof cb === 'function') {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---into function--invokeCallback--args-', args);
    return cb.apply(null, args);
  } else {
    if (!!args[0]) {
      //write log response
      const filePath = './logTmp.txt';
      const text = moment().format('YYYYMMDDHH') + ': ' + args[0];
      fs.appendFile(filePath, text, function (err) {
        if (err) console.error("Error to write invokeCallback error: " + text);
      });
      
      //response
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---into error--invokeCallback---', args[0]);
      return Promise.reject(args[0]);
    } else {
      //write log response
      const filePath = './logTmp.txt';
      const text = moment().format('YYYYMMDDHH') + ': ' + args[1];
      fs.appendFile(filePath, text, function (err) {
        if (err) console.error("Error to write invokeCallback success: " + text);
      });
      
      //response
      console.log(moment().format('YYYY-MM-DD HH:mm:ss'), '---into success--invokeCallback---', args[1]);
      return Promise.resolve(args[1]);
    }
  }
};

utils.JSONParse = function (opts, defaults) {
  defaults = defaults || null;
  try {
    defaults = JSON.parse(opts)
  } catch (e) {
    console.error(e.stack || e);
  }
  return defaults
};

/**
 * clone an object
 */

utils.print = function (err, res) {
  if (err) {
    console.error('error: ', err, res);
  }
};

utils.random = function (len) {
  var str = '';
  for (var i = 0, l = len || 4; i < l; i++) {
    var random = parseInt(Math.random() * 10);
    str = str.concat(random.toString());
  }
  return str;
};

utils.generatorTransaction = function (len) {
  var dateString = moment()
    .format('YYYYMMDDHHmmss');
  for (var i = 0, l = len || 4; i < l; i++) {
    var random = parseInt(Math.random() * 10);
    dateString = dateString.concat(random.toString());
  }
  return dateString;
};

utils.md5 = function (data) {
  return md5(data);
};

utils.interval = function (func, wait, times) {
  var interv = function (w, t) {
    return function () {
      if (typeof t === "undefined" || t-- > 0) {
        setTimeout(interv, w);
        try {
          func.call(null);
        } catch (e) {
          t = 0;
          throw e;
        }
      }
    };
  }(wait, times);
  setTimeout(interv, wait);
};

utils.fillToken = function (msg, opts) {
  var obj = {
    phone: '[phone]',
    password: '[password]',
    service: '[service]',
    hotline: '[hotline]',
    syntax: '[syntax]',
    name: '[name]',
    package: '[package]',
    expire: '[expire]'
  };
  
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    if (opts[keys[i]]) {
      // msg = msg.replace(obj[keys[i]], opts[keys[i]]);
      msg = msg
        ? msg.replace(obj[keys[i]], opts[keys[i]])
        : '';
    }
  }
  return msg;
};

utils.log = function (service, data, request) {
  var m = moment();
  var filePath = "./logs/" + service + "/" + m.format('YYYY/MM/DD') + ".log";
  var dirPath = "./logs/" + service + "/" + m.format('YYYY/MM');
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(dirPath, '0777', true);
  }
  var text = '';
  if (request) {
    text += "\n---------------------------------------------\n";
  }
  text += m.format('HH:mm:ss ') + JSON.stringify(data) + "\n";
  fs.appendFile(filePath, text, function (err) {
    if (err) console.error("Error to write: " + text);
  });
};

utils.convertPhone = function (msisdn) {
  var phone = msisdn.toString()
    .trim();
  if (phone.indexOf('84') !== 0) {
    phone = '84' + phone;
  }
  return phone;
};


utils.convert03xTo016x = function (phone) {
  return phone
  // return phone.startsWith('843') ? phone.replace('843', '8416') : phone
};

utils.duplicatePhone = function (phone) {
  return phone
  // return phone.startsWith('843') ? phone.replace('843', '8416') : phone.replace('8416', '843')
};
