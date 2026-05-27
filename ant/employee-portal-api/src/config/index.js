'use strict';

require('dotenv').config();

const config = {
  sapBaseUrl: process.env.SAP_BASE_URL || 'http://AZKTLDS5CP.kcloud.com:8000',
  sapUser: process.env.SAP_USER || 'K902093',
  sapPassword: process.env.SAP_PASSWORD || '',
  sapServicePath: '/sap/opu/odata/SAP/ZHXM_EMPLOYEE_PORTAL_SRV_093_SRV',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
};

module.exports = config;
