// Setup env vars antes de que cualquier módulo los lea
process.env.ANTHROPIC_API_KEY        = 'sk-ant-test-key';
process.env.SUPABASE_URL             = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.REVENUECAT_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.NODE_ENV                 = 'test';
process.env.PORT                     = '3001';
