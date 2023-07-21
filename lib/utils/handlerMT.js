/**
 * Send MT
 */

"use strict";

const soap = require('soap');
const config = require('../../config/config');
const utils = require('./utils');
const handler = {};


handler.send = function (opts, cb) {
  console.log('sendMT: ', opts);
  soap.createClient(config.sendMT.url, function (err, client) {
    if (err) {
      return utils.invokeCallback(cb, err);
    }

    client.on('request', function (req) {
      console.log('req: ', req);
    });

    client.on('response', function (message) {
      console.log('response: ', message);
    });

    client.smsRequest({
      username: config.sendMT.username,
      password: config.sendMT.password,
      msisdn: opts.msisdn,
      content: opts.content,
      shortcode: opts.shortcode || 5291,
      alias: opts.shortcode || 5291,
      params: 'Text'
    }, function (err, result) {
      utils.invokeCallback(cb, err, result);
    })
  });
};

module.exports = handler;
