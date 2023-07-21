module.exports = {
  SERVER_APP: {
    BASE_URL: 'http://api3-onplay.gviet.vn',
    API: {
      createUser: '/api/v2/server-api/createUser',
      checkUser: '/api/v2/server-api/checkUserExists',
      checkCondition: '/api/v2/server-api/checkCondition',
      addPackage: '/api/v2/server-api/addPackage'
    },
    SECRET: 'VTVCabON@6789'
  },
  SERVER_PAYMENT: {
    PARTNER: 'mobiMuale',

    // BASE_URL: 'http://123.30.235.187:1005',
    // BASE_URL_TEST: 'http://123.30.235.187:1005',
    BASE_URL: 'http://api3-onplay.gviet.vn',

    API: {
      checkSynTaxUrl: '/payment-purchase/webhook/v1/create-payment',
      addPackageUrl: '/payment-purchase/webhook/v1/finish-payment'
    }
  },
  PAYGATE_SERVICE: {
    // BASE_URL_TEST: 'http://localhost:8008',
    BASE_URL: 'http://localhost:8008',
    // BASE_URL: 'http://api3-onplay.gviet.vn',

    API: {
      checkUser: '/paygate/sms/checkUser',
      addPackage: '/paygate/sms/addPackage'
    },
    SECRET: 'VTVCabON@6789',
    PARTNER_ID: 'mobiMuale',
    PHONES_TEST: ['0904229846']
  },
  TELCO: {
    PAY_PARTNER: 'telco',
    TELCOID: 'MOBI_TAI_LE',
    PAYTYPE: 1,
    TYPE: 2,

    // put cdr
    PUT_CDR: {
      host: '10.50.9.248',
      port: 21,
      user: 'vtvcab',
      password: 'vc0227',
      debugMode: true
    },

    // relation telco config
    EventID: '000010',
    CP_ID: '000064',
    CP_CODE: 'ON',
    SERVICE_CODE: '9029',

    BUY_FILM: {
      HOST: 'http://172.16.50.20:6994/vtvcab-on/mo',
      // HOST: 'http://vcms.gviet.vn/vtvcab-on/mo',
      USER: 'cuongvx',
      PASS: 'mjhurtSZdoNHxyxs875NXH',
      PREFIX: '$',
      TELCO_MAP: {
        VINA: 1,
        VIETTEL: 2,
        MOBI: 3,
        VNM: 4
      }
    },
    MPAY: {
      HOST: 'mpay.mobifone.vn',
      USER: 'vtvcab',
      PASS: 'vtvcab123v'
    },
    MT_ACTIVE: {
      MT1: 'Quy khach da mua thanh cong goi <packageName> <amount> cho tai khoan <account>.'
      + ' Han su dung den <expireTime> (Khong tu dong gia han).'
      + ' Truy cap ngay ung dung VTVcab ON de su dung',

      MT1_BUYFILM: 'Quy khach da mua thanh cong noi dung <titleFilm> <amount> cho tai khoan <account>.'
      + ' Han su dung den <expireTime> (Khong tu dong gia han).'
      + ' Truy cap ngay ung dung VTVcab ON de su dung',

      MT2_HAS_PASS: ' (MK dang nhap: <password>). De duoc tro giup, lien he 19001515 (2000d/phut).',
      MT2_NOT_HAS_PASS: '. De duoc tro giup, lien he 19001515 (2000d/phut).',
      MT2_BONUS: ' Quy khach duoc tang them <bonusMonth> thang su dung goi <packageName> dich vu VTVcab ON',

      MT_ERROR_SYSTEM: 'Hien tai he thong dang ban. Quy khach vui long thu lai sau. Chi tiet LH 19001515 (2000d/phut).',
      MT_WRONG_SYNTAX: 'Tin nhan sai cu phap. Quy khach vui long kiem tra lai. Chi tiet LH 19001515 (2000d/phut).',
      MT_WRONG_ACCOUNT: 'Thong tin tai khoan sai dinh dang. Quy khach vui long kiem tra noi dung tin nhan va thuc hien lai. Chi tiet LH 19001515 (2000d/phut).',
      MT_INVALID_TRANSACTION: 'Giao dich cua Quy khach khong hop le. De biet chi tiet, vui long lien he 9090. Xin cam on!'
    },

    PACKAGE: {
      ON_VIP1: {
        name: 'ON VIP 1',
        amount: 66000,
        expireMonth: 1,
        bonusMonth: 0,
        contentCode: 'VIP',
        contentID: '0000640007',
        syntax: {
          reg: ['NAP66', 'NAP1']
        }
      },
      ON_VIP3: {
        name: 'ON VIP 3',
        amount: 198000,
        expireMonth: 3,
        bonusMonth: 1,
        contentCode: 'VIP',
        contentID: '0000640007',
        syntax: {
          reg: ['NAP198', 'NAP3']
        }
      },

      ON_VIP6: {
        name: 'ON VIP 6',
        amount: 396000,
        expireMonth: 6,
        bonusMonth: 2,
        contentCode: 'VIP',
        contentID: '0000640007',
        syntax: {
          reg: ['NAP396']
        }
      },
      ON_VIP12: {
        name: 'ON VIP 12',
        amount: 792000,
        expireMonth: 12,
        bonusMonth: 4,
        contentCode: 'VIP',
        contentID: '0000640007',
        syntax: {
          reg: ['NAP792', 'NAP5']
        }
      },
      ON_VIP24: {
        name: 'ON VIP 24',
        amount: 1584000,
        expireMonth: 24,
        bonusMonth: 8,
        contentCode: 'VIP',
        contentID: '0000640007',
        syntax: {
          reg: ['NAP1584']
        }
      },

      ON_GD1: {
        name: 'ON GD 1',
        amount: 88000,
        expireMonth: 1,
        bonusMonth: 0,
        contentCode: 'GD',
        contentID: '0000640006',
        syntax: {
          reg: ['NAP88', 'NAP1']
        }
      },
      ON_GD3: {
        name: 'ON GD 3',
        amount: 264000,
        expireMonth: 3,
        bonusMonth: 1,
        contentCode: 'GD',
        contentID: '0000640006',
        syntax: {
          reg: ['NAP264', 'NAP3']
        }
      },
      ON_GD6: {
        name: 'ON GD 6',
        amount: 528000,
        expireMonth: 6,
        bonusMonth: 2,
        contentCode: 'GD',
        contentID: '0000640006',
        syntax: {
          reg: ['NAP528']
        }
      },
      ON_GD12: {
        name: 'ON GD 12',
        amount: 1056000,
        expireMonth: 12,
        bonusMonth: 4,
        contentCode: 'GD',
        contentID: '0000640006',
        syntax: {
          reg: ['NAP1056', 'NAP5']
        }
      },
      ON_GD24: {
        name: 'ON GD 24',
        amount: 2112000,
        expireMonth: 24,
        bonusMonth: 8,
        contentCode: 'GD',
        contentID: '0000640006',
        syntax: {
          reg: ['NAP2112']
        }
      },
      ON_DA1: {
        name: 'ON DA 1',
        amount: 50000,
        expireMonth: 1,
        bonusMonth: 0,
        contentCode: 'DA',
        contentID: '0000640005',
        syntax: {
          reg: ['NAP50', 'NAP1']
        }
      },
      ON_DA3: {
        name: 'ON DA 3',
        amount: 150000,
        expireMonth: 3,
        bonusMonth: 1,
        contentCode: 'DA',
        contentID: '0000640005',
        syntax: {
          reg: ['NAP150', 'NAP3']
        }
      },
      ON_DA6: {
        name: 'ON DA 6',
        amount: 300000,
        expireMonth: 6,
        bonusMonth: 2,
        contentCode: 'DA',
        contentID: '0000640005',
        syntax: {
          reg: ['NAP300']
        }
      },
      ON_DA12: {
        name: 'ON DA 12',
        amount: 600000,
        expireMonth: 12,
        bonusMonth: 4,
        contentCode: 'DA',
        contentID: '0000640005',
        syntax: {
          reg: ['NAP600', 'NAP5']
        }
      },
      ON_DA24: {
        name: 'ON DA 24',
        amount: 1200000,
        expireMonth: 24,
        bonusMonth: 8,
        contentCode: 'DA',
        contentID: '0000640005',
        syntax: {
          reg: ['NAP1200']
        }
      },
      ON_K1: {
        name: 'ON K 1',
        amount: 169000,
        expireMonth: 1,
        bonusMonth: 0,
        contentCode: 'K',
        contentID: '0000640005',
        syntax: {
          reg: ['NAP169']
        }
      },
      ON_K3: {
        name: 'ON K 3',
        amount: 507000,
        expireMonth: 3,
        bonusMonth: 0,
        contentCode: 'K',
        contentID: '0000640005',
        syntax: {
          reg: ['NAP507']
        }
      },
      ON_CB: {
        name: 'ON CB 1',
        amount: 159000,
        expireMonth: 3,
        bonusMonth: 0,
        contentCode: 'CB',
        contentID: '0000640005',
        syntax: {
          reg: ['NAP159']
        }
      },
      MUA_LE: {
        name: 'MUA_LE',
        amount: null,
        expireMonth: null,
        bonusMonth: 0,
        contentCode: 'M',
        contentID: '0000640004',
        syntax: {
          reg: [
            'NAP1',
            'NAP3',
            'NAP5',
            'NAP10',
            'NAP20',
            'NAP30',
            'NAP40',
            'NAP50',
            'NAP100',
            'NAP200',
            'NAP300',
            'NAP500'
          ]
        },
        listContent: {
          1000: ['TL001', 'TL002', 'TL003', 'TL004', 'TL005', 'TL006', 'TL007', 'TL008', 'TL009', 'TL010'],
          3000: ['TL003', 'TL201', 'TL202', 'TL203', 'TL204', 'TL205', 'TL206', 'TL207', 'TL208', 'TL209', 'TL210'],
          5000: ['TL501', 'TL502', 'TL503', 'TL504', 'TL505', 'TL506', 'TL507', 'TL508', 'TL509', 'TL510'],
          10000: ['TL010', 'TL801', 'TL802', 'TL803', 'TL804', 'TL805', 'TL806', 'TL807', 'TL808', 'TL809', 'TL810'],
          20000: ['GD020', 'GD001', 'GD002', 'GD003', 'GD004', 'GD005', 'GD006', 'GD007', 'GD008', 'GD009', 'GD010'],
          30000: ['GD030', 'GD201', 'GD202', 'GD203', 'GD204', 'GD205', 'GD206', 'GD207', 'GD208', 'GD209', 'GD210'],
          40000: ['GD040', 'GD501', 'GD502', 'GD503', 'GD504', 'GD505', 'GD506', 'GD507', 'GD508', 'GD509', 'GD510'],
          50000: ['GD050', 'GD801', 'GD802', 'GD803', 'GD804', 'GD805', 'GD806', 'GD807', 'GD808', 'GD809', 'GD810'],
          100000: ['BT100', 'BT103', 'BT104', 'BT105', 'BT106', 'BT107', 'BT108', 'BT109', 'BT110'],
          200000: ['BT200', 'BT503', 'BT504', 'BT505', 'BT506', 'BT507', 'BT508', 'BT509', 'BT510'],
          300000: ['SS300', 'SS103', 'SS104'],
          500000: ['SS500', 'SS501', 'SS503', 'SS504']
        }
      }
    }
  }
}

