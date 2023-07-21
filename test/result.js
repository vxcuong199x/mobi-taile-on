/**
 *	Testing result services
 */

'use strict'

const soap = require('soap')
const url = 'http://127.0.0.1:8601/receiveresult?wsdl'

var client

before(function (done) {
  soap.createClient(url, function (err, cli) {
    if (err) {
      console.error(err)
      process.exit()
    }
    client = cli
    done()
  })
})

describe('Result services testing', function () {
  it('Renew msisdn OK should be ok', function (done) {
    let args = {
      username: 'sctvsub',
      password: 'sctv@789',
      serviceid: 'TUVANTHETHAO_SCTV',
      msisdn: '979286704',
      chargetime: '20150528080000',
      nextRenewalTime: '20150529080000',
      params: 0,
      command: 'TIP',
      mode: 'REAL',
      amount: 10000
    }
    client.resultRequest(args, function (err, result) {
      console.log('response: ', err, result)
      done(err)
    })
  })

  // it('Renew msisdn FAIL should be ok', function (done) {
  //   let args = {
  //     username: 'sctvsub',
  //     password: 'sctv@789',
  //     serviceid: 'TIP',
  //     msisdn: '979286704',
  //     chargetime: '20150528080000',
  //     nextRenewalTime: '20150529080000',
  //     params: 1,
  //     command: 'TIP',
  //     mode: 'REAL',
  //     amount: 10000
  //   };
  //   client.resultRequest(args, function (err, result) {
  //     console.log('response: ', err, result);
  //     done(err);
  //   });
  // });
})
