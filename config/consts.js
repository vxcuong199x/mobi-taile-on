/**
 * Created by bi on 3/4/16.
 */

module.exports = {
  CODE: {
    OK: 0,
    FAIL: 1,
    OK_FREE: 3,
    OK_CHARGED: 4,
    NOT_ENOUGH_MONEY: 5,
    USER_NOT_EXISTS: 100,
    WRONG_ACCOUNT: 102,
    INVALID_TRANSACTION: 103,
    WRONG_PARAM: 300,
    AUTH_FAIL: 301,
    ERROR: 302,
    WRONG_PARAM_LISTENMO: 200,
    AUTH_FAIL_LISTENMO: 201,
    ERROR_LISTENMO: 400
  },

  CHARING: {
    FAIL: 1,
    OK: 0
  },

  STATE: {
    INIT: 'init',
    FIRST_SUCESS: 'reg',
    AGAIN_SUCESS: 'renew',
    FAIl: 'fail'
  },
  MODE: {
    CHECK: 'CHECK',
    REAL: {
      'WCG-0000': 'Giao dịch thành công.',
      'WCG-0001': 'Thuê bao không hợp lệ',
      'WCG-0002': 'Dữ liệu CP gửi lên sai',
      'WCG-0003': 'Không gửi  được mã OTP cho khách hàng',
      'WCG-0004': 'Không kết nối được đến Charging Proxy',
      'WCG-0005': 'Tài khoản không đủ để thực hiện trừ tiền',
      'WCG-0010': 'Lỗi hệ thống WebCharging',
      'WCG-0006': 'Nhập sai mã OTP',
      'WCG-0007': 'Lỗi gửi tin nhắn báo trừ tiền',
      'WCG-0008': 'Chưa khai báo CPCODE',
      'WCG-0009': 'Số tiền thanh toán quá lớn',
      'WCG-0011': 'Thời gian chờ xác nhận OTP quá lâu',
      'WCG-0012': 'Số tiền nạp trong ngày lớn hơn 500k',
      'WCG-0013': 'Đã gửi OTP cho khách hàng'
    }
  }
}
