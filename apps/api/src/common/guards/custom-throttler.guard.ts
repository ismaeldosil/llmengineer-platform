import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration } = requestProps;
    const { req, res } = this.getRequestResponse(context);

    // Get the tracker key (usually IP address)
    const tracker = await this.getTracker(req);
    const key = this.generateKey(context, tracker, throttler.name);

    // Get current usage from storage
    const { totalHits, timeToExpire } = await this.storageService.increment(
      key,
      ttl,
      limit,
      blockDuration,
      throttler.name
    );

    // Calculate remaining requests
    const remaining = Math.max(0, limit - totalHits);
    const resetTime = Date.now() + timeToExpire;

    // Set rate limit headers
    res.header('X-RateLimit-Limit', limit.toString());
    res.header('X-RateLimit-Remaining', remaining.toString());
    res.header('X-RateLimit-Reset', new Date(resetTime).toISOString());

    // Check if limit exceeded
    if (totalHits > limit) {
      res.header('Retry-After', Math.ceil(timeToExpire / 1000).toString());
      throw new ThrottlerException();
    }

    return true;
  }

  protected getRequestResponse(context: ExecutionContext) {
    const http = context.switchToHttp();
    return { req: http.getRequest(), res: http.getResponse() };
  }
}
