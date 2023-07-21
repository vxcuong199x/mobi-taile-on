/**
 *	Testing result services
 */

'use strict'

const soap = require('soap')
const url = 'http://127.0.0.1:8602/molistener?wsdl'

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

describe('Mo services testing', function () {
  it('HD should be ok', function (done) {
    let args = {
      username: 'sctvsub',
      password: 'sctv@789',
      source: '979286704',
      dest: '0',
      content: 'HD',
      mode: 'REAL',
      amount: '10000'
    }
    client.moRequest(args, function (err, result) {
      console.log('response: ', err, result)
      done(err)
    })
  })
})
