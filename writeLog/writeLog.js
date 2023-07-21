'use strict'
const moment = require('moment')
const md5 = require('md5')
const Promise = require('bluebird')

const CONNECTION = require('../config/connection')
const TELCO_CONFIG = require('../config/telcoConfig')
const consts = require('../config/consts')
const model = require('../common/model')
const helper = require('../common/helper')

const writeLog = {}
module.exports = writeLog

writeLog.saveLogMt = (paramsGeneral) => {
  const { params, reqBody, response, callApi } = paramsGeneral

  let data = Object.assign({}, params, response)
  data = Object.assign(data, helper.getTimeCurr())

  delete data.callApi
  data.route = 'mo_listen'

  data.moListener = {
    params: reqBody,
    response,
    callApiApp: callApi || {}
  }

  return model.insertOne({
    data,
    collection: CONNECTION.mongo.col.tran
  })
}
writeLog.saveTran = (paramsGeneral) => {
  const { params, reqBody, response, callApi } = paramsGeneral

  let data = Object.assign({}, params, response)
  data = Object.assign(data, helper.getTimeCurr())

  data.telcoId = TELCO_CONFIG.TELCO.TELCOID
  data.route = 'add_package'
  delete data.callApi
  delete data.return

  const isCheckSub = (params.mode === consts.MODE.CHECK)
  if (isCheckSub) {
    data.checkSub = {
      params: reqBody,
      response,
      callApiApp: callApi
    }
    data.status = consts.STATE.INIT// init

    return model.insertOne({
      data,
      collection: CONNECTION.mongo.col.tran
    })
  } else {
    data.notifySub = {
      params: reqBody,
      response,
      callApiApp: callApi,
      createdAt: data.createdAt,
      createdAt__: data.createdAt__
    }

    data.status = (response.code === consts.CODE.OK)
      ? consts.STATE.FIRST_SUCESS
      : consts.STATE.FAIl
    data.amount = Number(reqBody.totalAmount || 0)

    return model.findOne({
      where: {
        account: data.account,
        mode: { $ne: consts.MODE.CHECK },
        status: consts.STATE.FIRST_SUCESS,
        route: 'add_package'
      },
      collection: CONNECTION.mongo.col.tran
    })
      .then((tranFirst) => {
        if (tranFirst && tranFirst.account) {
          data.status = consts.STATE.AGAIN_SUCESS
        }

        return model.insertOne({
          data,
          collection: CONNECTION.mongo.col.tran
        })
      })
  }
}
writeLog.saveUserPass = ({ username, password }) => {
  helper.console('saveUserPass', 'username', username)

  username = helper.addZeroPhone(username)

  const data = {
    _id: md5(username),
    username,
    password,
    day: Number(moment().format('YYYYMMDD')),
    hour: Number(moment().format('YYYYMMDDHH')),
    createdAt: new Date()
  }
  return model.insertOne({
    data,
    collection: CONNECTION.mongo.col.user
  })
}
writeLog.getPassword = (username) => {
  username = helper.addZeroPhone(username)

  return model.findOne({
    where: {
      username
      // createdAt: {$gte: new Date(moment().add(-1, 'm').format('YYYY-MM-DD HH:mm:ss'))}
    },
    collection: CONNECTION.mongo.col.user
  }).then((rs) => {
    return Promise.resolve(rs && rs.password || null)
  })
}

writeLog.getExpireFilm = (params) => {
  return model.find({
    where: {
      account: helper.addZeroPhone(params.account),
      other: params.other,
      code: 0// success
    },
    fields: { expireFilm: 1 },
    sort: { createdAt: -1 },
    limit: 1,
    collection: CONNECTION.mongo.col.tran
  }).then((rs) => {
    const rsItem = rs[0] || {}

    return Promise.resolve(rsItem && rsItem.expireFilm || null)
  })
}

writeLog.getRevenue = ({ gameCode }) => {
  const day = Number(moment().format('YYYYMMDD'))

  return model.findOne({
    where: { day, gameCode },
    collection: CONNECTION.mongo.col.revenue
  }).then((rsItem) => {
    return Promise.resolve(rsItem)
  })
}

writeLog.saveRevenue = async ({ day, amount, limit, gameCode }) => {
  helper.console('saveRevenue', 'amount', amount)

  if (!amount) {
    return Promise.resolve(true)
  }

  const data = {
    _id: md5(day + gameCode),
    day,
    limit,
    gameCode
  }
  const inc = {
    revenue: amount
  }

  return model.updateOne({
    collection: CONNECTION.mongo.col.revenue,
    data,
    inc
  })
}

