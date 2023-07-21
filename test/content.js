/**
 * Created by vxcuong on 25/12/19.
 */
'use strict'

const _ = require('lodash')
const moment = require('moment')
const Promise = require('bluebird')

const consts = require('../config/consts')
const helper = require('../common/helper')
const callApi = require('../common/callApi')

const TELCO_CONFIG = require('../config/telcoConfig')
const writeLog = require('../writeLog/writeLog')
const limitRevenue = 450 * 1000 * 1000
let hadSendMail = false

const GetContent = function () {
  let self = this

  this.map = {
    'HD': 'guide',
    'KT': 'getInfo',
    'MK': 'resetPassword'
  }
  this.startServer = function (args, cb) {
    helper.consoleInit('contentRequest', 'args', args)

    let rsReturn = {}
    // check valid request
    const { valid, params, message } = self.validRequest(args)
    if (valid !== consts.CODE.OK) {
      rsReturn = {
        return: valid,
        message
      }
      self.response({ args, params, rsReturn }, cb)
      return
    }

    // main logic
    const runPromise = (params.result === consts.MODE.CHECK)
      ? self.modeCheck(params)
      : self.modeReal(params)

    runPromise
      .then((rs) => {
        rsReturn = rs
        rsReturn.message = rsReturn.message || 'success'

        helper.console('rsReturn', 'then', rsReturn)
        self.response({ args, params, rsReturn }, cb)
      })
      .catch((err) => {
        rsReturn = {
          return: consts.CODE.FAIL,
          message: (err.stack || err) || 'fail'
        }

        helper.sendEmail({
          orderId: args.msisdn,
          err: (err.stack || err),
          params: args
        })

        helper.console('rsReturn', 'catch', rsReturn)
        self.response({ args, params, rsReturn }, cb)
      })
  }
  this.modeCheck = function (args) {
    let rsCheckUser__, rsCreateUser__, rsCheckCondition__ = null;
    let successCheckUser, invalidUser, successCreateUser, successCheckCondition = null;
    const hasBuyFilm = this.getBuyFilm(args);
    helper.console('modeCheck', 'hasBuyFilm', hasBuyFilm);

    return callApi.checkUser({
      account: args.account
    })
      .then((rsCheckUser) => {
        rsCheckUser__ = rsCheckUser;

        if (hasBuyFilm)
          return writeLog.getRevenue();
        else return Promise.resolve({});

      })
      .then((objRevenue) => {
        const day = Number(moment().format('YYYYMMDD'));

        //sendmail warning
        if (hasBuyFilm) {
          if (objRevenue && objRevenue.revenue >= (limitRevenue - 20000)) {
            helper.console('modeCheck', 'hadSendMail', hadSendMail);

            if (!hadSendMail) {
              helper.sendEmail({
                subject: 'STOP_MX_MOBI_' + day,
                text: `REVENUE: ${objRevenue.revenue};  LIMIT: ${limitRevenue}`,
                addUser: true
              });
              hadSendMail = true;
            }
            return Promise.resolve({});

          } else hadSendMail = false;
        }

        invalidUser = Number(_.get(rsCheckUser__, 'resApi.code') === 1)
        if (invalidUser)
          return Promise.resolve({});

        successCheckUser = _.has(rsCheckUser__, 'resApi.info.username')

        rsCheckUser__.success = successCheckUser ? 'SUCCESS' : 'FAIL';
        helper.console('successCheckUser', 'successCheckUser', successCheckUser);

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
          };
          return callApi.checkCondition(params);
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
    helper.console('hasBuyFilm', 'hasBuyFilm', hasBuyFilm);

    const ignoreRes = true;
    const params = {
      msisdn: args.msisdn,
      account: args.account,
      packageCode: args.mo || args.command,
      amount: args.amount || 0,
      tranId: args.tranId || null,
    };
    const { packageItem } = self.getPackageItem(args);
    const expireItem = moment().add(packageItem.expireMonth || 0 + packageItem.bonusMonth || 0, 'months').unix();

    const promise = hasBuyFilm
      ? {
      rsAddPackage: callApi.buyContent(args),
      rsAddPackageIgnore: callApi.addPackage(params, ignoreRes)
    }
      : {
      rsAddPackage: callApi.addPackage(params)
    };

    return Promise.props(promise)
      .then(({ rsAddPackage, rsAddPackageIgnore }) => {
        rsAddPackage__ = rsAddPackage;
        rsAddPackageIgnore__ = rsAddPackageIgnore;

        if (!hasBuyFilm
          && rsAddPackage
          && rsAddPackage.resApi
          && !rsAddPackage.resApi.expire
        ) {
          rsAddPackage.resApi.expire = expireItem;
        }

        successAddPackage =
          hasBuyFilm
            ? (rsAddPackage
          && rsAddPackage.resApi
          && rsAddPackage.resApi.hasOwnProperty('status') && rsAddPackage.resApi.status == 0)
            : (
            rsAddPackage
            && rsAddPackage.resApi
            && rsAddPackage.resApi.expire
          );

        rsAddPackage__.success = successAddPackage ? 'SUCCESS' : 'FAIL';
        helper.console('successAddPackage', 'successAddPackage', rsAddPackage, successAddPackage);

        if (successAddPackage) {
          const promiseList = {
            password: writeLog.getPassword(args.account),
          };

          // if (hasBuyFilm)
          //   promiseList.expireFilm = writeLog.getExpireFilm(args);

          return Promise.props(promiseList);
        } else Promise.resolve({});
      })
      .then((rs) => {
        const password = rs.password || null;
        const expireFilm = rs.expireFilm || null;

        helper.console('password', 'password', password);
        helper.console('expireFilm', 'expireFilm', expireFilm);

        const callApi = {
          addPackage: rsAddPackage__,
          addPackageIgnore: rsAddPackageIgnore__,
        };
        const condModeReal = successAddPackage;
        objReturn = condModeReal
          ? { return: consts.CODE.OK, password, expireFilm, callApi }
          : { return: consts.CODE.FAIL, callApi };

        if (hasBuyFilm && objReturn.return == consts.CODE.OK) {
          return writeLog.saveRevenue({
            day: Number(moment().format('YYYYMMDD')),
            amount: Number(args.amount),
            limit: limitRevenue,
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

      if (_.has(rsReturn, 'callApi.addPackage.resApi.expire')) {
        expireTime__ = moment(rsReturn.callApi.addPackage.resApi.expire).unix();
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
      let expireTime = _.get(rsReturn, 'callApi.addPackage.resApi.expire')
      expireTime = moment.unix(expireTime).format('HH:mm:ss')
        + ', '
        + moment.unix(expireTime).format('DD-MM-YYYY');

      mt1 = MT1.replace('<packageName>', packageItem.name || '')
        .replace('<tranId>', params.tranId || '')
        .replace('<amount>', amount)
        .replace('<amount>', amount)
        .replace('<account>', params.account || '')
        .replace('<expireTime>', expireTime);
    }

    const mt2 = rsReturn.password
      ? MT2_HAS_PASS.replace('<password>', rsReturn.password || '')
      : MT2_NOT_HAS_PASS;

    let mt2_bonus = '';
    if (packageItem.bonusMonth)
      mt2_bonus = MT2_BONUS.replace('<packageName>', packageItem.name || '')
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

    helper.console('checkSub', 'params', params);
    return {
      valid: consts.CODE.OK,
      message: 'SUCCESS',
      params
    };
  };

  this.response = ({ args, params, rsReturn }, cb) => {
    const mt = self.getMt(params, rsReturn);
    console.log('mt', mt)
  };
}

const paramsCheck = {
  'content_id': 'NAP66|abc |dee2228b45cd4707bc79f1c77769c92a',
  'cpCode': 'ON',
  'gameCode': 'DA',
  'totalAmount': '66000',
  'account': '0349609861',
  'isdn': '0349609861',
  'result': 'CHECK'
}

const paramsNotify = {
  "content_id": "nap150|302|20a6efe6047f462c8ef670d18a0505eb",
  "cpCode": "ON",
  "gameCode": "DA",
  "totalAmount": "150000",
  "account": "0349609861",
  "isdn": "0349609861",
  "result": "WCG-0000"
}

new GetContent().startServer(paramsNotify)
