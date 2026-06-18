const config = {
  oauth: {
    clientId: '1f966b5f-9b47-413c-b7a9-9eb2c30dd772',
    clientSecret: 'UT1CUaS2EbULnkVe2NWK1Ptf0QNKd4LcvDWg8Fcc',
    redirectUri: 'http://localhost:8000/redirect',
    authUrl: 'https://rca.oneflow.test/oauth/authorize',
    tokenUrl: 'https://rca.oneflow.test/oauth/token',
    scope: 'accounts.read branches.read reporting_tags.read reports.balance_sheet.read reports.income_statement.read reports.trial_balance.read offline_access',
  },
  api: {
    baseUrl: 'https://rca.oneflow.test/api/v2',
  },
};

export default config;
