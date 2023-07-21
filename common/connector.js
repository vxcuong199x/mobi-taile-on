const MongoClient = require('mongodb').MongoClient
const connection = require('../config/connection')

module.exports.mongo = connect(connection.mongo.mongoPayGate, 'paygate')

function connect (url, dbName) {
  console.log('mongoUrl: ', url)
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      (err, client) => {
        if (err) {
          return reject(err)
        }

        console.log('[CONNECTED MONGO]')
        resolve(client.db(dbName))
      }
    )
  })
}

