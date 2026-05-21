export const successResponse = (data, message = 'Success', meta = null) => ({
  success: true,
  message,
  data,
  ...(meta && { meta }),
});

export const errorResponse = (message, code = 'ERROR', details = null) => ({
  success: false,
  message,
  error: { code, ...(details && { details }) },
});
