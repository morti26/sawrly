import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

test('env example includes required production keys', () => {
  const envExamplePath = path.join(cwd, '.env.example');
  const envExample = fs.readFileSync(envExamplePath, 'utf8');

  assert.ok(envExample.includes('DATABASE_URL='));
  assert.ok(envExample.includes('JWT_SECRET='));
  assert.ok(envExample.includes('APP_SETTINGS_ENCRYPTION_KEY='));
  assert.ok(envExample.includes('PAYMENT_WEBHOOK_SECRET='));
  assert.ok(envExample.includes('NEXT_PUBLIC_APP_URL='));
});

test('payment runtime supports manual and online methods', () => {
  const runtimePath = path.join(cwd, 'lib', 'payment-runtime.ts');
  const runtimeSource = fs.readFileSync(runtimePath, 'utf8');

  assert.ok(runtimeSource.includes('MANUAL_PAYMENT_METHODS'));
  assert.ok(runtimeSource.includes("GATEWAY_PAYMENT_METHOD = 'online'"));
  assert.ok(runtimeSource.includes("mode: 'manual' | 'gateway'"));
});

test('online payment checkout routes are wired for retry flow', () => {
  const checkoutRoutePath = path.join(cwd, 'app', 'api', 'checkout', 'route.ts');
  const checkoutRouteSource = fs.readFileSync(checkoutRoutePath, 'utf8');

  assert.ok(checkoutRouteSource.includes('gatewayCheckoutUrls'));
  assert.ok(checkoutRouteSource.includes('onlineCheckoutErrors'));

  const retryRoutePath = path.join(
    cwd,
    'app',
    'api',
    'payments',
    '[id]',
    'online-checkout',
    'route.ts'
  );
  assert.ok(fs.existsSync(retryRoutePath));
  const retryRouteSource = fs.readFileSync(retryRoutePath, 'utf8');
  assert.ok(retryRouteSource.includes('createGatewayCheckout'));
});

test('admin readiness endpoint is available', () => {
  const readinessRoutePath = path.join(cwd, 'app', 'api', 'admin', 'readiness', 'route.ts');
  assert.ok(fs.existsSync(readinessRoutePath));
  const readinessRouteSource = fs.readFileSync(readinessRoutePath, 'utf8');
  assert.ok(readinessRouteSource.includes('buildReadinessReport'));
});

test('theme composer is centralized and backward compatible', () => {
  const composerPath = path.join(cwd, 'lib', 'theme_composer.ts');
  const source = fs.readFileSync(composerPath, 'utf8');
  assert.ok(source.includes('generateVisualTheme'));
  assert.ok(source.includes('THEME_COMPOSER_PRESETS'));
  assert.ok(source.includes('backgroundMesh'));
  assert.ok(source.includes('ambientGlows'));
  assert.ok(source.includes('variation'));

  const routeSource = fs.readFileSync(path.join(cwd, 'app', 'api', 'admin', 'theme-settings', 'route.ts'), 'utf8');
  assert.ok(routeSource.includes('themeComposer'));

  const pageSource = fs.readFileSync(path.join(cwd, 'app', 'admin', '(dashboard)', 'theme-settings', 'page.tsx'), 'utf8');
  assert.ok(pageSource.includes('setEasyMode(true)'));
  assert.ok(pageSource.includes('grid grid-cols-1 gap-6 lg:grid-cols-5'));
  assert.ok(pageSource.includes('lg:col-span-2 lg:sticky'));
  assert.ok(pageSource.includes('space-y-6 lg:col-span-3'));
  assert.ok(pageSource.includes('easyMode ? "hidden"'));
  assert.ok(pageSource.includes('Auto WOW'));
});
