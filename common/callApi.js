'use strict'
const moment = require('moment')
const axios = require('axios')
const Promise = require('bluebird')
const _ = require('lodash')

const md5 = require('md5')
const TELCO_CONFIG = require('../config/telcoConfig')
const { SERVER_APP, PAYGATE_SERVICE } = TELCO_CONFIG

const paymentApi = require('../common/paymentApi')
const helper = require('../common/helper')

const headers = {
  'Content-Type': 'application/json; charset=utf-8'
}
const timeout = 15000

const callApi = {}
callApi.buyContent = (params, again = 0) => {
  const { BUY_FILM } = TELCO_CONFIG.TELCO

  const dataApi = {
    msisdn: params.msisdn, //
    cmdCode: params.synTax || params.mo, // syntax
    transactionId: params.tranId || `MOBI${moment().unix()}`,

    // config
    serviceID: TELCO_CONFIG.TELCO.SERVICE_CODE,
    telcoId: BUY_FILM.TELCO_MAP.MOBI,
    username: BUY_FILM.USER
  }
  dataApi.chargeTime = moment().format('YYYY-MM-DD HH:mm:ss')
  dataApi.cmdCode = dataApi.cmdCode.trim()
  dataApi.signature = md5(
    dataApi.msisdn
    + BUY_FILM.PREFIX + dataApi.cmdCode
    + BUY_FILM.PREFIX + dataApi.serviceID
    + BUY_FILM.PREFIX + BUY_FILM.PASS
  )

  const url = BUY_FILM.HOST
  helper.console('buyContent', 'dataApi', url, dataApi)

  return axios.post(
    url,
    dataApi,
    headers,
    timeout
  ).then(res => {
    helper.console('SUCCESS', 'buyContent', dataApi, res.data)

    return Promise.resolve({
      url,
      dataApi,
      resApi: res.data
    })
  })
    .catch(err => {
      helper.error('buyContent', 'buyContent', err)
      const resMessage = `buyContent: ${(err.stack || err).substr(0, 100)}`
      const condRetry = (resMessage.indexOf('timeout') > -1)

      if (condRetry && again < 3) {
        again++
        return callApi.buyContent(params, again)
      } else {
        return Promise.reject({
          url,
          dataApi,
          resApi: resMessage
        })
      }
    })
}
callApi.createUser = (params, again = 0) => {
  const dataApi = {
    username: params.account,
    password: params.password.toString(),
    signature: md5(params.account + '|' + params.password + '|' + TELCO_CONFIG.SERVER_APP.SECRET)
  }
  const url = TELCO_CONFIG.SERVER_APP.BASE_URL + TELCO_CONFIG.SERVER_APP.API.createUser

  helper.console('createUser', 'dataApi', url, dataApi)

  return axios.post(
    url,
    dataApi,
    headers,
    timeout
  ).then(res => {
    helper.console('SUCCESS', 'createUser', dataApi, res.data)

    return Promise.resolve({
      url,
      dataApi,
      resApi: res.data
    })
  })
    .catch(err => {
      helper.error('createUser', 'createUser', err)
      const resMessage = `createUser: ${(err.stack || err).substr(0, 100)}`
      const condRetry = (resMessage.indexOf('timeout') > -1)

      if (condRetry && again < 3) {
        again++
        return callApi.createUser(params, again)
      } else {
        return Promise.reject({
          url,
          dataApi,
          resApi: resMessage
        })
      }
    })
}
callApi.checkUser = (params, again = 0) => {
  let opts

  if (!params.hasBuyFilm && PAYGATE_SERVICE.PHONES_TEST.includes(params.account)) {
    opts = {
      url: PAYGATE_SERVICE.BASE_URL + PAYGATE_SERVICE.API.checkUser,
      method: 'POST',
      data: {
        'username': params.account,
        'msisdn': params.msisdn,
        'mo': (params.mo || '').trim().toUpperCase(),
        'cpCode': (params.cpCode || '').trim().toUpperCase(),
        'gameCode': (params.gameCode || '').trim().toUpperCase(),
        'packageCode': (params.packageCode || '').trim().toUpperCase(),
        'amount': params.amount,
        'logTime': moment(params.eventTime).toDate(),
        'partner': PAYGATE_SERVICE.PARTNER_ID
      }
    }
  } else {
    opts = {
      url: SERVER_APP.BASE_URL + SERVER_APP.API.checkUser,
      method: 'GET',
      params: {
        username: params.account,
        signature: md5(params.account + '|' + SERVER_APP.SECRET)
      }
    }
  }

  helper.console('checkUser', 'opts', JSON.stringify(opts))
  return axios(opts)
    .then(({ data }) => {
      helper.console('SUCCESS', 'checkUser', JSON.stringify(opts), JSON.stringify(data))

      return Promise.resolve({
        url: opts.url,
        dataApi: opts.data || opts.params,
        resApi: data
      })
    })
    .catch(err => {
      helper.error('checkUser', 'checkUser', err)
      const resMessage = `checkUser: ${(err.stack || err).substr(0, 100)}`
      const condRetry = (resMessage.indexOf('timeout') > -1)

      if (condRetry && again < 3) {
        again++
        return callApi.checkUser(params, again)
      } else {
        return Promise.reject({
          url: opts.url,
          dataApi: opts.data || opts.params,
          resApi: resMessage
        })
      }
    })
}

callApi.checkCondition = (params, again = 0) => {
  const dataApi = {
    username: params.account,
    telcoSyntax: params.packageCode,
    telcoId: TELCO_CONFIG.TELCO.TELCOID,
    amount: Number(params.amount || 0)
  }

  dataApi.telcoOrderId = md5(
    (params.msisdn || 0)
    + dataApi.username
    + dataApi.telcoSyntax
    + (dataApi.tranId || 0)
    + dataApi.amount.toString()
    + (again === 0
      ? moment().format('YYYYMMDDHHmmss')
      : moment().format('YYYYMMDDHH'))
  )
  dataApi.signature = md5(
    dataApi.username
    + '|' + dataApi.telcoSyntax
    + '|' + dataApi.telcoId
    + '|' + TELCO_CONFIG.SERVER_APP.SECRET
  )

  const url = TELCO_CONFIG.SERVER_APP.BASE_URL + TELCO_CONFIG.SERVER_APP.API.checkCondition
  helper.console('checkCondition', 'dataApi', url, dataApi)

  return axios.get(
    url,
    { params: dataApi }
  ).then(res => {
    helper.console('SUCCESS', 'checkCondition', dataApi, res.data)
    return Promise.resolve({
      url,
      dataApi,
      resApi: res.data
    })
  })
    .catch(err => {
      helper.error('checkCondition', 'checkCondition', err)
      const resMessage = `checkCondition: ${(err.stack || err).substr(0, 100)}`
      const condRetry = (resMessage.indexOf('timeout') > -1)

      if (condRetry && again < 3) {
        again++
        return callApi.checkCondition(params, again)
      } else {
        return Promise.reject({
          url,
          dataApi,
          resApi: resMessage
        })
      }
    })
}
callApi.checkCondition_ = (params, again = 0) => {
  const dataApi = {
    username: params.account,
    telcoSyntax: params.packageCode,
    amount: Number(params.amount || 0),
    uid: params.uid
  }
  dataApi.transId = md5((params.msisdn || 0)
    + dataApi.username
    + dataApi.telcoSyntax
    + (params.tranId || 0)
    + dataApi.amount.toString()
  ).substr(0, 19)

  return paymentApi.checkCondition({
    params: dataApi
  })
}

callApi.addPackage = (params, ignoreRes = false, again = 0) => {
  const KEYLOG = `-------${params.account || ''}___${params.msisdn || ''}: /api/addPackage; method = addPackage; indexAgain=${again}; ignoreRes=${ignoreRes}: `

  params.transactionId = params.transactionId || helper.generateTransactionId()

  let opts
  if (!params.hasBuyFilm && PAYGATE_SERVICE.PHONES_TEST.includes(params.account)) {
    opts = {
      url: PAYGATE_SERVICE.BASE_URL + PAYGATE_SERVICE.API.addPackage,
      method: 'POST',
      headers,
      timeout,
      data: {
        'msisdn': params.msisdn,
        'mo': (params.mo || '').trim().toUpperCase(),
        'partnerTransId': params.tranId,
        'amount': params.amount,
        'partner': PAYGATE_SERVICE.PARTNER_ID
      }
    }
  } else {
    const dataApi = {
      username: params.account,
      telcoSyntax: params.packageCode,
      telcoId: TELCO_CONFIG.TELCO.TELCOID,
      amount: Number(params.amount || 0),
      transactionId: params.transactionId
    }

    dataApi.telcoOrderId = md5(
      (params.msisdn || 0)
      + dataApi.username
      + dataApi.telcoSyntax
      + (dataApi.tranId || 0)
      + dataApi.amount.toString()
      + (again === 0
        ? moment().format('YYYYMMDDHHmmss')
        : moment().format('YYYYMMDDHH'))
    )
    dataApi.signature = md5(
      dataApi.username
      + '|' + dataApi.telcoSyntax
      + '|' + dataApi.telcoId
      + '|' + TELCO_CONFIG.SERVER_APP.SECRET
    )

    opts = {
      url: SERVER_APP.BASE_URL + SERVER_APP.API.addPackage,
      method: 'POST',
      headers,
      timeout,
      data: dataApi
    }
  }
  opts.data.addPackageInfo = JSON.parse(JSON.stringify(opts))

  console.log('DATA_API_TO_APP', KEYLOG, JSON.stringify(opts))
  return axios(opts)
    .then(res => {
      console.log('RESPONSE_FROM_SERVER_APP', KEYLOG, JSON.stringify(opts), res.data)

      return Promise.resolve({
        url: opts.url,
        dataApi: opts.data,
        resApi: res.data
      })
    })
    .catch(async err => {
      console.log('ERROR_FROM_SERVER_APP', KEYLOG, JSON.stringify(opts), err.stack || err)
      console.error('ERROR_FROM_SERVER_APP', KEYLOG, JSON.stringify(opts), err.stack || err)

      const resMessage = `addPackage: ${(_.get(err, 'response.data') || err.stack || err).substr(0, 100)}`
      const condRetry = (resMessage.indexOf('timeout') > -1)

      if (condRetry && again < 3) {
        again++

        await Promise.delay(timeout)
        return callApi.addPackage(params, ignoreRes, again)
      } else {
        if (ignoreRes) {
          return Promise.resolve({
            url: opts.url,
            dataApi: opts.data,
            resApi: resMessage
          })
        } else {
          return Promise.reject({
            url: opts.url,
            dataApi: opts.data,
            resApi: resMessage
          })
        }
      }
    })
}
callApi.addPackage_ = (params, ignoreRes = false, again = 0) => {
  const KEYLOG = `-------${params.account || ''}___${params.msisdn || ''}: /api/addPackage; method = addPackage; indexAgain=${again}; ignoreRes=${ignoreRes}: `
  const dataApi = {
    username: params.account,
    partnerTransId: params.tranId,
    amount: Number(params.amount || 0),
    telcoSyntax: params.packageCode
  }
  dataApi.transId = md5((params.msisdn || 0)
    + dataApi.username
    + dataApi.telcoSyntax
    + (params.tranId || 0)
    + dataApi.amount.toString()
  ).substr(0, 19)

  return paymentApi.addPackage({
    params: dataApi
  })
}

module.exports = callApi
