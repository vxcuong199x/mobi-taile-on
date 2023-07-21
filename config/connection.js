module.exports = {
  mongo: {
    // mongoPayGate: "mongodb://u.paygate:n7RA2Pugr2Bn@172.16.20.174:3337/paygate?replicaSet=mongo_rep&readPreference=nearest&maxPoolSize=100&connectTimeoutMS=20000",
    mongoPayGate: 'mongodb://u.paygate:n7RA2Pugr2Bn@172.16.20.174:3337,172.16.20.175:3337,172.16.20.176:3337/paygate?replicaSet=mongo_rep&readPreference=nearest&maxPoolSize=100&connectTimeoutMS=20000',
    col: {
      tran: 'zTransaction_mobi',
      user: 'zUser_mobi',
      logMt: 'zLogMt_mobi',
      putCdr: 'zPutCdr_mobi',
      revenue: 'zRevenue_mobi'
    }
  }
}

