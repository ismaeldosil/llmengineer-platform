# Rate Limiting Implementation

This directory contains the custom throttler guard implementation for rate limiting across the API.

## Overview

The LLM Engineer Platform API uses `@nestjs/throttler` with a custom guard to implement rate limiting and protect against API abuse. The implementation adds standard rate limit headers to all responses.

## Configuration

### Global Settings

The default rate limit is configured in `app.module.ts`:

- **TTL**: 60,000ms (1 minute)
- **Limit**: 100 requests per minute

### Endpoint-Specific Limits

Different endpoints have different rate limits based on their sensitivity:

| Endpoint | Limit | TTL | Reason |
|----------|-------|-----|--------|
| `/auth/login` | 10 req/min | 60s | Prevent brute force attacks |
| `/auth/register` | 10 req/min | 60s | Prevent spam registrations |
| `/lessons/:id/quiz` | 30 req/min | 60s | Prevent quiz submission spam |
| Other endpoints | 100 req/min | 60s | General API protection |

## Custom Throttler Guard

The `CustomThrottlerGuard` extends the base `ThrottlerGuard` from `@nestjs/throttler` and adds the following response headers:

### Headers

1. **X-RateLimit-Limit**: Maximum number of requests allowed in the time window
2. **X-RateLimit-Remaining**: Number of requests remaining in the current window
3. **X-RateLimit-Reset**: ISO timestamp when the rate limit resets
4. **Retry-After** (when limit exceeded): Seconds until the rate limit resets

### Example Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 2025-12-12T10:30:00.000Z
```

When rate limit is exceeded (429 response):

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-12-12T10:30:00.000Z
Retry-After: 45
```

## Usage

### Applying to a Controller

Use the `@Throttle()` decorator to override the default rate limit for specific routes:

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async login(@Body() loginDto: LoginDto) {
    // ...
  }
}
```

### Swagger Documentation

Add the 429 response to your API documentation:

```typescript
@ApiResponse({
  status: 429,
  description: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
})
```

For controller-level documentation (applies to all routes):

```typescript
@Controller('users')
@ApiResponse({ status: 429, description: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' })
export class UsersController {
  // ...
}
```

## Testing

The guard includes comprehensive unit tests in `custom-throttler.guard.spec.ts`:

- Guard configuration validation
- Rate limit logic verification
- Header calculation tests
- Edge case handling

Run tests with:

```bash
npm run test -w @llmengineer/api -- --testPathPattern=custom-throttler.guard.spec.ts
```

## Implementation Details

### How It Works

1. The guard intercepts each request before it reaches the controller
2. It generates a unique key based on the request (typically IP address)
3. It increments a counter in storage (in-memory by default)
4. It calculates and sets the rate limit headers
5. If the limit is exceeded, it throws a `ThrottlerException` (HTTP 429)

### Storage

By default, the throttler uses in-memory storage. For production environments with multiple instances, consider using Redis:

```typescript
ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService(redisClient),
  throttlers: [{ ttl: 60000, limit: 100 }],
})
```

## Security Considerations

1. **IP-based tracking**: Rate limits are tracked per IP address by default
2. **Header exposure**: Rate limit headers help legitimate users avoid hitting limits
3. **Time windows**: Fixed time windows (not sliding) for simpler implementation
4. **429 responses**: Standard HTTP status code for rate limit exceeded

## Future Enhancements

Potential improvements for the future:

- [ ] Redis-based storage for distributed rate limiting
- [ ] User-based rate limiting (in addition to IP-based)
- [ ] Dynamic rate limits based on user tier/subscription
- [ ] Rate limit bypass for whitelisted IPs
- [ ] Metrics and monitoring for rate limit violations
