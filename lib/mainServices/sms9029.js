/**
 * Created by vxcuong on 25/12/19.
 */
"use strict";

const _ = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');
const md5 = require('md5');

const consts = require('../../config/consts');
const helper = require('../../common/helper');
const callApi = require('../../common/callApi');
const config = require('../../config/config');

const TELCO_CONFIG = require('../../config/telcoConfig');
const writeLog = require('../../writeLog/writeLog');
const soapServices = require('../libServices/soapServices');

const configRevenue = {
  'DA': {
    limitRevenue: 100 * 1000 * 1000,
    hadSendMail: false
  },
  'OTHER': {
    limitRevenue: 450 * 1000 * 1000,
    hadSendMail: false
  }
};


const GetContent = function () {
  let self = this;

  this.map = {
    'HD': 'guide',
    'KT': 'getInfo',
    'MK': 'resetPassword'
  };
  this.test = function (args) {
    helper.consoleInit('contentRequest', 'args', JSON.stringify(args));

    let rsReturn = {};
    //check valid request
    const { valid, params, message } = self.validRequest(args);
    if (valid !== consts.CODE.OK) {
      rsReturn = {
        return: valid,
        message
      };
      self.response({ args, params, rsReturn }, console.log);
      return;
    }

    //main logic
    const runPromise = (params.result === consts.MODE.CHECK)
      ? self.modeCheck(params)
      : self.modeReal(params);

    runPromise
      .then((rs) => {
        rsReturn = rs;
        rsReturn.message = rsReturn.message || 'success';

        self.response({ args, params, rsReturn }, console.log);
      })
      .catch((err) => {
        console.error('ERROR: ', args.account, JSON.stringify(err))

        rsReturn = {
          return: consts.CODE.FAIL,
          message: (err.stack || err) || 'fail'
        };

        //helper.sendEmail({
        //  orderId: args.msisdn,
        //  err: (err.stack || err),
        //  params: args,
        //});

        self.response({ args, params, rsReturn }, console.log);
      });
  }
  this.startServer = function (server, env) {
    const myService = {
      CPWebServiceImplServiceService: {
        CPWebServiceImplServicePort: {
          receiveResultWebCharging: (args, cb) => {
            helper.consoleInit('contentRequest', 'args', args);

            let rsReturn = {};
            //check valid request
            const { valid, params, message } = self.validRequest(args);
            if (valid !== consts.CODE.OK) {
              rsReturn = {
                return: valid,
                message
              };
              self.response({ args, params, rsReturn }, cb);
              return;
            }

            //main logic
            const runPromise = (params.result === consts.MODE.CHECK)
              ? self.modeCheck(params)
              : self.modeReal(params);

            runPromise
              .then((rs) => {
                rsReturn = rs;
                rsReturn.message = rsReturn.message || 'success';

                self.response({ args, params, rsReturn }, cb);
              })
              .catch((err) => {
                console.error('ERROR: ', args.account, JSON.stringify(err))

                rsReturn = {
                  return: consts.CODE.FAIL,
                  message: (err.stack || err) || 'fail'
                };

                helper.sendEmail({
                  orderId: args.msisdn,
                  err: (err.stack || err),
                  params: args,
                });

                self.response({ args, params, rsReturn }, cb);
              });
          }
        }
      }
    };
    const wsdl = config.getContent.wsdl[env];
    const soapServer = new soapServices();
    soapServer.start(server, myService, wsdl, config.getContent.path);
  };

  this.modeCheck = function (args) {
    let rsCheckUser__, rsCreateUser__, rsCheckCondition__ = null;
    let successCheckUser, invalidUser, successCreateUser, successCheckCondition = null;
    const hasBuyFilm = this.getBuyFilm(args);
    args.hasBuyFilm = hasBuyFilm;

    console.log('hasBuyFilm ', args.account, hasBuyFilm)
    const gameCode = (args.gameCode === 'DA')
      ? 'DA'
      : 'OTHER';

    return callApi.checkUser(Object.assign({}, args))
      .then((rsCheckUser) => {
        rsCheckUser__ = rsCheckUser;

        if (hasBuyFilm) {
          return writeLog.getRevenue({
            gameCode
          });
        }
        else return Promise.resolve({});

      })
      .then((objRevenue) => {
        const day = Number(moment().format('YYYYMMDD'));

        //sendmail warning
        if (hasBuyFilm) {
          const revenueCurrent = _.get(objRevenue, 'revenue') || 0
          const limitRevenue = _.get(configRevenue[gameCode], 'limitRevenue')

          if (revenueCurrent >= (limitRevenue - 20000)) {
            const hadSendMail = _.get(configRevenue[gameCode], 'hadSendMail')

            if (!hadSendMail) {
              helper.sendEmail({
                subject: (args.gameCode === 'DA')
                  ? 'STOP_MX_MOBI_ONDA_' + day
                  : 'STOP_MX_MOBI_' + day,
                text: `REVENUE: ${revenueCurrent};  LIMIT: ${limitRevenue}`,
                addUser: true
              });

              configRevenue[gameCode].hadSendMail = true;
            }
            return Promise.resolve({});

          } else if (configRevenue[gameCode]) {
            configRevenue[gameCode].hadSendMail = false;
          }
        }

        invalidUser = Number(_.get(rsCheckUser__, 'resApi.code') === 1)
        if (invalidUser)
          return Promise.resolve({});

        successCheckUser = _.has(rsCheckUser__, 'resApi.info.username')

        rsCheckUser__.success = successCheckUser ? 'SUCCESS' : 'FAIL';
        console.log('successCheckUser ', args.account, successCheckUser)

        if (!successCheckUser)
          return callApi.createUser({
            account: args.account,
            password: helper.randomPass(5),
          });
        else return Promise.resolve({});
      })
      .then((rsCreateUser) => {
        rsCreateUser__ = rsCreateUser;

        successCreateUser = Number(_.get(rsCreateUser, 'resApi.info.code')) === 1
        if (rsCreateUser.resApi)
          rsCreateUser__.success = successCreateUser ? 'SUCCESS' : 'FAIL';

        const condModeCheck = (
          successCheckUser
          || (!successCheckUser && successCreateUser)
        );

        if (condModeCheck) {
          const params = {
            msisdn: args.msisdn,
            account: args.account,
            packageCode: args.mo || args.command,
            amount: args.amount || 0,
            tranId: args.tranId || null,
            uid: _.get(rsCheckUser__, 'resApi.info.uid') || _.get(rsCreateUser__, 'resApi.info.accountnumber')
          };

          if (hasBuyFilm) {
            return callApi.checkCondition(params);
          } else {
            return callApi.checkCondition_(params);
          }
        }
        else return Promise.resolve({});
      })
      .then((rsCheckCondition) => {
        rsCheckCondition__ = rsCheckCondition;

        successCheckCondition = Number(_.get(rsCheckCondition, 'resApi.enable') === 1)

        if (rsCheckCondition.resApi)
          rsCheckCondition__.success = successCheckCondition ? 'SUCCESS' : 'FAIL';

        const condModeCheck = (
            successCheckUser
            || (!successCheckUser && successCreateUser)
          ) && successCheckCondition;

        const callApi = {
          checkUser: rsCheckUser__,
          createUser: rsCreateUser__,
          rsCheckCondition: rsCheckCondition__,
        };

        const objReturn = condModeCheck
          ? { return: consts.CODE.OK, callApi }
          : invalidUser
                            ? { return: consts.CODE.WRONG_ACCOUNT, callApi }
                            : !successCheckCondition
              ? { return: consts.CODE.INVALID_TRANSACTION, callApi }
              : { return: consts.CODE.FAIL, callApi };

        return Promise.resolve(objReturn);
      });
  };
  this.modeReal = function (args) {
    let rsAddPackage__ = null;
    let rsAddPackageIgnore__ = null;
    let successAddPackage = null;
    let objReturn = null;
    const hasBuyFilm = this.getBuyFilm(args);
    args.hasBuyFilm = hasBuyFilm
    console.log('hasBuyFilm ', args.account, hasBuyFilm)

    const ignoreRes = true;
    const params = Object.assign({}, args, {
      msisdn: args.msisdn,
      account: args.account,
      packageCode: args.mo || args.command,
      amount: args.amount || 0,
      tranId: args.tranId || null,
    });
    const { packageItem } = self.getPackageItem(args);
    const expireItem = moment().add(packageItem.expireMonth || 0 + packageItem.bonusMonth || 0, 'months').unix();


    console.log('params: ', params)
    const promise = hasBuyFilm
      ? {
      rsAddPackage: callApi.buyContent(args),
      rsAddPackageIgnore: callApi.addPackage(params, ignoreRes)
    }
      : {
      rsAddPackage: (params.account === '0349609863_')
        //rsAddPackage: (params.account === '0931365464')
        ? Promise.resolve({})
        : callApi.addPackage_(params)
    }

    return Promise.props(promise)
      .then(({ rsAddPackage, rsAddPackageIgnore }) => {

        if ((params.account === '0349609863_')) {
          //if ((params.account === '0931365464')) {
          rsAddPackage.resApi = {
            "status": 0,
            "data": [
              {
                "planId": "1",
                "planName": "Gói ON VIP",
                "userId": "21729978",
                "username": "0903500112",
                "maxDeviceLogin": 5,
                "maxDeviceStream": 1,
                "expiredAt": "2025-01-05T02:38:06.111Z",
                "createdAt": "2020-12-18T14:33:31.000Z",
                "updatedAt": "2022-09-08T23:52:02.107Z"
              },
              {
                "planId": "2",
                "planName": "Gói ON DA",
                "userId": "21729978",
                "username": "0903500112",
                "maxDeviceLogin": 4,
                "maxDeviceStream": 4,
                "expiredAt": "2025-01-05T02:38:06.112Z",
                "createdAt": "2020-12-18T14:33:31.000Z",
                "updatedAt": "2022-09-08T23:52:02.109Z"
              },
              {
                "planId": "8",
                "planName": "Gói K+ (Cine & Life)",
                "userId": "21729978",
                "username": "0903500112",
                "maxDeviceLogin": 3,
                "maxDeviceStream": 1,
                "expiredAt": "2025-01-05T02:38:06.112Z",
                "createdAt": "2022-01-05T02:38:06.116Z",
                "updatedAt": "2022-09-08T23:52:02.111Z"
              }
            ],
            "message": "Success",
            "orderId": "a2a2e7abb4c10884662",
            "expire": 1670543545
          }
        }

        rsAddPackage__ = rsAddPackage;
        rsAddPackageIgnore__ = rsAddPackageIgnore;

        //if (!hasBuyFilm
        //  && rsAddPackage
        //  && rsAddPackage.resApi
        //  && !rsAddPackage.resApi.expire
        //) {
        //  rsAddPackage.resApi.expire = expireItem;
        //}

        successAddPackage = rsAddPackage
          && rsAddPackage.resApi
          && rsAddPackage.resApi.hasOwnProperty('status')
          && rsAddPackage.resApi.status == 0

        rsAddPackage__.success = successAddPackage ? 'SUCCESS' : 'FAIL';
        console.log('successAddPackage', hasBuyFilm, args.account, successAddPackage, JSON.stringify(rsAddPackage.resApi));

        if (successAddPackage) {
          const promiseList = {
            password: writeLog.getPassword(args.account),
          };

          // if (hasBuyFilm)
          //   promiseList.expireFilm = writeLog.getExpireFilm(args);

          return Promise.props(promiseList);
        } else return Promise.resolve({});
      })
      .then((rs) => {
        const password = rs.password || null;
        const expireFilm = rs.expireFilm || null;

        console.log('password expireFilm', args.account, password, expireFilm);
        const callApi = {
          addPackage: rsAddPackage__,
          addPackageIgnore: rsAddPackageIgnore__,
        };
        const condModeReal = successAddPackage;
        objReturn = condModeReal
          ? { return: consts.CODE.OK, password, expireFilm, callApi }
          : { return: consts.CODE.FAIL, callApi };

        if (hasBuyFilm && objReturn.return == consts.CODE.OK) {
          const gameCode = (args.gameCode === 'DA')
            ? 'DA'
            : 'OTHER'

          return writeLog.saveRevenue({
            day: Number(moment().format('YYYYMMDD')),
            amount: Number(args.amount),
            limit: Number(_.get(configRevenue[gameCode], 'limitRevenue')),
            gameCode
          });
        }
        else return Promise.resolve({});
      })
      .then(() => {
        return Promise.resolve(objReturn);
      })
  };

  this.getBuyFilm = function (params) {
    let hasBuyFilm = false;
    const cond = params.cpCode === 'ON'
      && (
        params.gameCode === 'M'
        || (params.gameCode === 'DA' && params.idFilm)
      );

    if (cond)
      hasBuyFilm = true;

    return hasBuyFilm;
  };
  this.getMt = function (params, rsReturn) {
    const { MT1, MT1_BUYFILM, MT2_BONUS, MT2_HAS_PASS, MT2_NOT_HAS_PASS, MT_ERROR_SYSTEM, MT_WRONG_ACCOUNT, MT_INVALID_TRANSACTION } = TELCO_CONFIG.TELCO.MT_ACTIVE;

    const { packageItem } = self.getPackageItem(params);
    const hasBuyFilm = this.getBuyFilm(params);

    if (rsReturn.return == consts.CODE.WRONG_ACCOUNT) {
      return MT_WRONG_ACCOUNT;
    } else if (rsReturn.return == consts.CODE.INVALID_TRANSACTION) {
      return MT_INVALID_TRANSACTION;
    } else if (rsReturn.return != consts.CODE.OK)
      return MT_ERROR_SYSTEM;
    else if (params.mode == consts.MODE.CHECK) {
      return 'OK';
    }

    let amount = Number(params.totalAmount || 0);

    let mt1 = null;
    if (hasBuyFilm) {

      let titleFilm = '';
      let expireTime__ = '';

      const valExpire = _.get(rsReturn, 'callApi.addPackage.resApi.data[0].expiredAt')
        || _.get(rsReturn, 'callApi.addPackage.resApi.expire')

      if (valExpire) {
        expireTime__ = moment(valExpire).unix();
      } else
        expireTime__ = moment().add(48, 'h').unix();
      params.expireFilm = moment.unix(expireTime__).format('YYYY-MM-DD HH:mm:ss');

      let expireTime = moment.unix(expireTime__).format('HH:mm:ss')
        + ', '
        + moment.unix(expireTime__).format('DD-MM-YYYY');

      if (params.gameCode === 'M') {
        let arrPkgFilm = packageItem.listContent || {};
        arrPkgFilm = arrPkgFilm[amount] || [];
        const idFilmMo = params.other || '';

        titleFilm = arrPkgFilm.indexOf(idFilmMo) > -1
          ? idFilmMo
          : 'other';
        titleFilm = params.idFilm || titleFilm.toUpperCase();
      } else {
        titleFilm = packageItem.name || ''
      }

      mt1 = MT1_BUYFILM
        .replace('<titleFilm>', titleFilm)
        .replace('<tranId>', params.tranId || '')
        .replace('<amount>', amount)
        .replace('<amount>', amount)
        .replace('<account>', params.account || '')
        .replace('<expireTime>', expireTime);
    } else {
      const expireOldVersion = _.get(rsReturn, 'callApi.addPackage.resApi.expire')
      const expireNewVersion = _.get(rsReturn, 'callApi.addPackage.resApi.data[0].expiredAt')

      const expireTime = (expireNewVersion ? moment(expireNewVersion).unix() : 0) || expireOldVersion
      const expireTime2 = moment.unix(expireTime).format('HH:mm:ss')
        + ', '
        + moment.unix(expireTime).format('DD-MM-YYYY');

      console.log(JSON.stringify({ expireOldVersion, expireNewVersion, expireTime, expireTime2 }))

      mt1 = MT1.replace('<packageName>', packageItem.name || params.gameCodeName || params.gameCode || '')
        .replace('<tranId>', params.tranId || '')
        .replace('<amount>', amount)
        .replace('<amount>', amount)
        .replace('<account>', params.account || '')
        .replace('<expireTime>', expireTime2);
    }

    const mt2 = rsReturn.password
      ? MT2_HAS_PASS.replace('<password>', rsReturn.password || '')
      : MT2_NOT_HAS_PASS;

    let mt2_bonus = '';
    if (packageItem.bonusMonth)
      mt2_bonus = MT2_BONUS.replace('<packageName>', packageItem.name || params.gameCodeName || params.gameCode || '')
        .replace('<bonusMonth>', packageItem.bonusMonth || '');

    return mt1 + mt2_bonus + mt2;
  };

  this.getPackageItem = function (params) {
    const packageCode = params.packageCode || '';
    const contentCode = params.gameCode || '';

    const { PACKAGE } = TELCO_CONFIG.TELCO;

    let packageItem = {};
    let packageKey = null;
    for (let key in PACKAGE) {
      const syntax = PACKAGE[key].syntax.reg;

      const cond = packageCode
        && (PACKAGE[key].contentCode === contentCode.toUpperCase())
        && syntax.indexOf(packageCode.toUpperCase()) > -1;

      if (cond) {
        packageItem = PACKAGE[key];
        packageKey = key;
      }
    }
    return { packageKey, packageItem };
  };

  this.validRequest = function (args) {
    const params = Object.assign({}, args);
    params.mode = params.result || '';

    const fields = ['content_id', 'cpCode', 'gameCode', 'totalAmount', 'account', 'isdn', 'result'];
    for (let i = 0; i < fields.length; i++) {
      if (!params[fields[i]] || typeof params[fields[i]] === 'undefined') {
        return {
          valid: consts.CODE.WRONG_PARAM,
          message: 'WRONG_PARAM',
          params
        };
      }
    }
    // params.mode = params.result;
    params.cpCode = params.cpCode.trim().toUpperCase()
    params.gameCode = params.gameCode.trim().toUpperCase()
    params.amount = Number(params.totalAmount || 0);
    params.msisdn = helper.add84Phone(params.isdn);

    // if (params.gameCode === 'CB') {
    //   return {
    //     valid: consts.CODE.INVALID_TRANSACTION,
    //     message: 'INVALID_TRANSACTION',
    //     params
    //   };
    // }

    let isdn = helper.addZeroPhone(params.isdn);
    let account = helper.addZeroPhone(params.account);
    account = account.trim().toLowerCase();

    params.account = (account == '0123456789')
      ? isdn
      : account;


    const contentIdArr = params.content_id.split('|');
    const length = contentIdArr.length;

    params.command = contentIdArr[0] || '';
    params.tranId = (length > 2)
      ? (contentIdArr[2] || '')
      : (contentIdArr[1] || '');

    params.mo = `${params.cpCode} ${params.gameCode} ${params.command} ${account}`;
    if (length > 2) {
      params.other = (contentIdArr[1] || null);
      params.other = params.other ? params.other.trim().toUpperCase() : null;
      params.idFilm = params.other ? params.other.split(' ')[0] : null;
      params.mo = params.other
        ? `${params.mo} ${params.other}`
        : `${params.mo}`;
      params.mo = params.mo.trim();
    }
    params.packageCode = params.command.toUpperCase();
    switch (params.gameCode) {
      case 'CB':
        params.gameCodeName = 'Combo'
        break;

      case 'K':
        params.gameCodeName = 'Kplus'
        break;
    }

    console.log('checkSub params: ', args.account, JSON.stringify(params));
    return {
      valid: consts.CODE.OK,
      message: 'SUCCESS',
      params
    };
  };

  this.response = ({ args, params, rsReturn }, cb) => {
    console.log('rsReturn: ', { rsReturn })

    const mt = self.getMt(params, rsReturn);
    const resLast = {
      return: (
        (rsReturn.return == consts.CODE.OK)
          ? consts.CODE.OK : consts.CODE.FAIL
      )
      + '|' + mt
    };
    const callApi = rsReturn.callApi || {};

    const resSave = {
      params,
      reqBody: args,
      callApi: callApi,
      response: Object.assign({
        code: rsReturn.return,
        message: rsReturn.message || '',
        mt
      }, resLast),
    };

    writeLog.saveTran(resSave);

    if (callApi.createUser && Object.keys(callApi.createUser).length) {
      console.log('saveUserPass', args.account)
      writeLog.saveUserPass({
        username: args.account,
        password: callApi.createUser.dataApi.password,
      });
    }

    console.log('resLast', args.account, resLast)
    cb(resLast);
  };
};
module.exports = GetContent;

//new GetContent().test({
//  content_id: 'NAP219||fa734b9eb06040558ea4df6f349f24e4_8',
//  cpCode: 'ON',
//  gameCode: 'CB',
//  totalAmount: '219000',
//  isdn: '0349609863',
//  account: '0349609863',
//  result: 'CHECK'
//})
//
//setTimeout(() => {
//  new GetContent().test({
//    content_id: 'NAP219||fa734b9eb06040558ea4df6f349f24e4_8',
//    cpCode: 'ON',
//    gameCode: 'CB',
//    totalAmount: '219000',
//    isdn: '0349609863',
//    account: '0349609863',
//    result: 'WCG-0000'
//  })
//}, 2000)

//setTimeout(() => {
//  new GetContent().test({
//    content_id: 'NAP198||fa734b9eb06040558ea4df6f349f24e4_4',
//    cpCode: 'ON',
//    gameCode: 'VIP',
//    totalAmount: '198000',
//    isdn: '0903500112',
//    account: '0903500112',
//    result: 'WCG-0000'
//  })
//}, 2000)
