const moment = require('moment')
const {mongo} = require('./connector')

const findOne = (params) => {
  const runTime = moment().format('YYYY-MM-DD HH:mm:ss')
  return new Promise((resolve, reject) => {
    return mongo.then((db) => {
      db.collection(params.collection)
        .findOne(
          params.where,
          params.fields || {},
          (err, result) => {
            if (err) {
              console.error(runTime, '-----------ERROR--findOne-----', JSON.stringify(params), err)
              return reject(err)
            } else {
              console.log(runTime, '-----------SUCCESS--findOne--succecss---', JSON.stringify(params))
              return resolve(result)
            }
          })
    })
  })
}

const find = (params) => {
  const runTime = moment().format('YYYY-MM-DD HH:mm:ss')
  return new Promise((resolve, reject) => {
    return mongo.then((db) => {
      const dbFind = db.collection(params.collection)
        .find(
          params.where,
          params.fields || {},
        )
      if (params.sort) {
        dbFind.sort(params.sort)
      }

      if (params.limit) {
        dbFind.limit(params.limit)
      }

      dbFind
        .toArray((err, result) => {
          if (err) {
            console.error(runTime, '-----------ERROR--findOne-----', JSON.stringify(params), err)
            return reject(err)
          } else {
            console.log(runTime, '-----------SUCCESS--find--succecss---', JSON.stringify(params))
            return resolve(result)
          }
        })
    })
  })
}

const insertOne = (params) => {
  const {data, collection} = params

  return new Promise((resolve, reject) => {
    return mongo.then((db) => {
      data.createdAt__ = moment().format('YYYY-MM-DD HH:mm:ss')

      const runTime = moment().format('YYYY-MM-DD HH:mm:ss')
      db.collection(collection).insertOne(
        data,
        (err, result) => {
          if (err) {
            console.error(runTime, '---------insertOne--err---', data.id || '', err)
            return reject(err)
          } else {
            console.log(runTime, '---------insertOne-succecss---', data.id || '')
            return resolve(result)
          }
        }
      )
    })
  })
}

const updateOne = (params) => {
  const {data, collection} = params
  const setData = {$set: data}
  if (params.push) {
    setData['$push'] = params.push
  }

  if (params.inc) {
    setData['$inc'] = params.inc
  }

  return new Promise((resolve, reject) => {
    return mongo.then((db) => {
      const runTime = moment().format('YYYY-MM-DD HH:mm:ss')
      db.collection(collection).updateOne(
        {_id: data._id},
        setData,
        {multi: false, upsert: true},
        (err, result) => {
          if (err) {
            console.error(runTime, '-----------updateOne--err---', data._id, err)
            return reject(err)
          } else {
            console.log(runTime, '------------updateOne--succecss---', data._id)
            return resolve(result)
          }
        }
      )
    })
  })
}

module.exports = {
  find,
  findOne,
  insertOne,
  updateOne
}
