const config = {
  oauth: {
    clientId: '3',
    clientSecret: 'IEpdt3Ru4AsnHNWutlY3qv0VKOEK75sVbv12IN0G',
    redirectUri: 'http://localhost:8000/redirect',
    authUrl: 'https://rca.oneflow.test/oauth/authorize',
    tokenUrl: 'https://rca.oneflow.test/oauth/token',
    scope: 'reports.trial_balance.read offline_access',
  },
  api: {
    baseUrl: 'https://rca.oneflow.test/api/v2',
  },
};

export default config;
