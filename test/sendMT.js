/**
 * Created by bi on 6/21/16.
 */

var handler = require('../lib/utils/handlerMT')

handler.send({
  msisdn: '1639308424',
  content: 'Mat khau truy cap dich vu SCTV The thao cua Quy khach la 712983.',
  shortcode: 5291
}, function (err, res) {
  console.log('Send: ', err, res)
})
