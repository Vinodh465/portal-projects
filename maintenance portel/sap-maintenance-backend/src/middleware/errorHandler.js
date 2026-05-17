/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message || err);

  // SAP OData / Axios errors
  if (err.response) {
    const sapStatus = err.response.status;
    const sapData = err.response.data;

    if (sapStatus === 401) {
      return res.status(401).json({
        success: false,
        error: 'SAP authentication failed. Check SAP credentials in .env',
      });
    }
    if (sapStatus === 403) {
      return res.status(403).json({
        success: false,
        error: 'Access denied by SAP system.',
      });
    }
    if (sapStatus === 404) {
      return res.status(404).json({
        success: false,
        error: 'SAP OData entity not found.',
      });
    }

    return res.status(sapStatus || 500).json({
      success: false,
      error: 'SAP OData service error',
      detail: sapData?.error?.message?.value || JSON.stringify(sapData),
    });
  }

  // Network / timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Cannot reach SAP server. Check network/VPN connection.',
    });
  }

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return res.status(504).json({
      success: false,
      error: 'SAP server request timed out.',
    });
  }

  // Generic
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
