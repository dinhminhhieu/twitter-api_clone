export const userErrorMessages = {
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  NAME_IS_REQUIRED: 'Tên là bắt buộc',
  NAME_MUST_BE_STRING: 'Tên phải là chuỗi kí tự',
  NAME_LENGTH_MUST_BE_FROM_1_TO_255: 'Tên phải chứa từ 1 - 255 kí tự chữ',
  EMAIL_IS_REQUIRED: 'Email là bắt buộc',
  EMAIL_IS_INVLID: 'Email không hợp lệ',
  EMAIL_ALREADY_EXISTS: 'Email đã tồn tại',
  PASSWORD_IS_REQUIRED: 'Mật khẩu là bắt buộc',
  PASSWORD_MUST_BE_STRING: 'Mật khẩu phải là chuỗi kí tự',
  PASSWORD_MUST_BE_STRONG:
    'Mật khẩu phải chứa tối thiểu 8 kí tự, tối thiểu 1 kí tự là chữ thường, chữ hoa, chữ số và kí tự đặc biệt',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Nhập lại mật khẩu là bắt buộc',
  CONFIRM_PASSWORD_MUST_BE_STRING: 'Nhập lại mật khẩu phải là chuỗi kí tự',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Nhập lại mật khẩu phải chứa tối thiểu 8 kí tự, tối thiểu 1 kí tự là chữ thường, chữ hoa, chữ số và kí tự đặc biệt',
  CONFIRM_PASSWORD_WRONG: 'Nhập lại mật khẩu không đúng',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Ngày, tháng, năm sinh phải là ISO8601',
  EMAIL_OR_PASSWORD_WRONG: 'Email hoặc mật khẩu không đúng',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token là bắt buộc',
  ACCESS_TOKEN_IS_INVALID: 'Access token không hợp lệ',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token là bắt buộc',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token không hợp lệ',
  REFRESH_TOKEN_NOT_EXIST: 'Refresh token không tồn tại hoặc đã hết hạn',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token là bắt buộc',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token không hợp lệ',
  EMAIL_VERIFY_TOKEN_EXPIRED: 'Email verify token không tồn tại hoặc đã hết hạn',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  EMAIL_VERIFIED_BEFORE: 'Email đã được xác thực trước đó',
  GOOGLE_EMAIL_NOT_EXIST: 'Email từ google không tồn tại'
} as const

export const userSuccessMessages = {
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  REFRESH_TOKEN_SUCCESS: 'Làm mới token thành công',
  EMAIL_VERIFY_SUCCESS: 'Xác thực email thành công'
} as const
