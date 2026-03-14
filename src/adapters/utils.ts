import * as idoaUtils from '@idoa/dev-doctor-utils';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries: number; minDelayMs: number }
): Promise<T> {
  const retryWithBackoff = (
    idoaUtils as unknown as {
      retryWithBackoff?: (
        operation: () => Promise<T>,
        retryOptions: {
          retries: number;
          retryDelayMs: number;
          maxRetryDelayMs: number;
          shouldRetry?: (error: unknown, attempt: number) => boolean;
        }
      ) => Promise<T>;
    }
  ).retryWithBackoff;

  if (typeof retryWithBackoff === 'function') {
    return retryWithBackoff(fn, {
      retries: options.retries,
      retryDelayMs: options.minDelayMs,
      maxRetryDelayMs: options.minDelayMs * Math.max(2, options.retries + 1)
    });
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= options.retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === options.retries) {
        break;
      }
      attempt += 1;
      await sleep(options.minDelayMs * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry failed');
}
