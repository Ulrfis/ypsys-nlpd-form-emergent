const { createGrainAnalytics } = require('@grainql/analytics-web');

const GRAIN_TENANT_ID = process.env.REACT_APP_GRAIN_TENANT_ID || 'nlpd-ypsys-fxi853';

const grain = createGrainAnalytics({
  tenantId: GRAIN_TENANT_ID,
});

export default grain;
