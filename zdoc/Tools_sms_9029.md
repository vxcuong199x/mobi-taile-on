# Project API SMS 9029 #

Bộ api xử lý việc nhận mo dịch vụ sms 9029

Hệ thống xử lý tập trung, hỗ trợ khai báo cú pháp trong CMS

### Thông tin project

Project domain:

- Url Public: http://vcms.gviet.vn/
- Url Private: http://vcms.gviet.vn/
- Url Localhost: http://vcms.gviet.vn/

Path: /vtvcab-on/mo

Method: GET hoặc POST

### Tham số đầu vào

| STT  | Tên tham số | Kiểu   | Ý nghĩa                                                      |
| ---- | ----------- | ------ | ------------------------------------------------------------ |
| 1    | msisdn      | string | Số thuê bao                                                  |
| 2    | cmdCode     | string | Cú pháp người dùng gửi lên                                   |
| 3    | serviceID   | string | Đầu số thuê bao gửi lên                                      |
| 4    | telcoId     | string | Mã nhà mạng: 1-vinaphone 2- viettel 3-mobifone 4-vietnamobile |
| 5    | username    | string | Tài khoản gửi thông tin                                      |
| 6    | signature   | string | Chữ ký bí mật do Thủ đô cấp                                  |

Trong đó: 

- Tham số username là tài khoản được thủ đô cấp

- Tham số signature là chữ kí xác thực được sinh ra bằng công thức: 

```php
$token = md5($msisdn . $prefix . $cmdCode . $prefix . $serviceID . $prefix . $password);
```

Trong đó, **$password** là khóa bí mật Thủ Đô cung cấp cho đối tác để định danh người dùng.

Ví dụ 1 request đầu vào.

> http://vcms.gviet.vn/vtvcab-on/mo?msisdn=84939413117&cmdCode=M1 0919222939 GD005 FPT&serviceID=9029&signature=b4ea0ef9940282062294345a5a5e19cf&username=vannh&telcoId=2



### Tham số đầu ra.

Đầu ra là 1 chuỗi json, cơ bản bao gồm các trường như sau

Ex:

```json
{
    "status": 3,
    "message": "Sai chu ky xac thuc."
}
```

#### Bảng tham số đầu ra.

Tham số đầu ra trong trường Result được mô tả như sau.

| Result | Ý nghĩa                              |
| ------ | ------------------------------------ |
| 2      | Sai hoac thieu tham so               |
| 3      | Sai chu ky xac thuc                  |
| 1      | Chưa có dữ liệu theo thông tin Input |
| 0      | Trả dữ liệu thành công.              |
| #      | Đều là thất bại                      |

Ví dụ 1 trường hợp Request thành công

```json
{
    "status": 0,
    "message": "Ban da thuc hien thanh cong giao dich"
}
```



### Ghi chú

Dữ liệu trả về thành công và có kết quả khi **status == 0**, ngược lại là thất bại. Khi **status == 0**, Kết quả sẽ được trả về trong message. Chi tiết xem trong chuỗi Json trả về.

### Liên hệ

Mọi thông tin đóng góp, thắc mắc, phản hồi xin liên hệ theo thông tin sau

| STT  | Họ tên         | SĐT           | Email           | Skype            |
| ---- | -------------- | ------------- | --------------- | ---------------- |
| 1    | Nguyễn An Hưng | 033.295.3760 | hungna@gviet.vn | nguyenanhung5891 |
| 2    | Nguyễn Thanh Tùng | 0919.222.939 | tungnt@gviet.vn | hiepsi_aotrang_1607|
