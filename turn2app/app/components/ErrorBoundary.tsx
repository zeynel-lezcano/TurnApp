/**
 * Error Boundary Component with Sentry Integration
 * 
 * Catches React errors and reports them to Sentry for monitoring
 */

import { ErrorBoundary as SentryErrorBoundary } from '@sentry/remix';
import { Banner, Page, Card, Text, Button } from '@shopify/polaris';
import { captureRemixError } from '../lib/sentry.server';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Fallback component shown when an error occurs
 */
function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Page title="Something went wrong">
      <Card>
        <Banner tone="critical" title="Application Error">
          <p>
            We're sorry, but something went wrong. Our team has been notified
            and is working to fix the issue.
          </p>
          
          {isDevelopment && (
            <div style={{ marginTop: '1rem' }}>
              <Text variant="headingMd" as="h3">Debug Information (Development Only):</Text>
              <div style={{ 
                marginTop: '0.5rem',
                padding: '1rem',
                backgroundColor: '#f6f6f7',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap'
              }}>
                {error.message}
                {error.stack && (
                  <>
                    {'\n\nStack Trace:\n'}
                    {error.stack}
                  </>
                )}
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={resetError} variant="primary">
              Try Again
            </Button>
          </div>
        </Banner>
      </Card>
    </Page>
  );
}

/**
 * Enhanced Error Boundary with Sentry integration
 */
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error as Error} resetError={resetError} />
      )}
      beforeCapture={(scope, error, errorInfo) => {
        // Add additional context for Sentry
        scope.setTag('component', 'error-boundary');
        if (errorInfo && typeof errorInfo === 'object') {
          scope.setContext('errorInfo', errorInfo as Record<string, any>);
        }
        scope.setLevel('error');
      }}
    >
      {children}
    </SentryErrorBoundary>
  );
}

/**
 * Route-level error boundary for Remix routes
 */
export function RouteErrorBoundary() {
  return (
    <ErrorFallback 
      error={new Error('Route Error')} 
      resetError={() => window.location.reload()} 
    />
  );
}