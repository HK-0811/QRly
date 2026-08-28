/**
 * JWT verification for /api/* routes.
 *
 * The Worker verifies Supabase access tokens itself rather than round-tripping to
 * /auth/v1/user on every request. That round trip would add a cross-region hop to
 * every write and make the API unavailable whenever Supabase Auth is.
 *
 * Project qragyngjqlizazdkaowa signs user tokens with ES256 and publishes the key
 * at /auth/v1/.well-known/jwks.json (architecture.md §15, resolved).
 *
 * Note the asymmetry that bites people here: the `anon` and `service_role` keys are
 * ALSO JWTs, but they are HS256 API keys, not user tokens. They must never verify
 * through this path — hence the explicit algorithm pin. A caller presenting the
 * anon key as a Bearer token gets a 401, which is correct: it identifies no user.
 */
import { createMiddleware } from 'hono/factory';
import { createRemoteJWKSet, jwtVerify, errors as joseErrors } from 'jose';
import type { Env } from '../env';

export interface AuthUser {
  id: string;
  email: string | null;
  role: string;
}

export type AuthVariables = { user: AuthUser };

// Module scope: the JWKS is fetched once per isolate and reused across requests.
// jose handles its own cooldown and rotation, so a rotated signing key recovers
// without a redeploy.
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(env: Env) {
  const url = env.SUPABASE_JWKS_URL || `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
  let jwks = jwksCache.get(url);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url), {
      cacheMaxAge: 10 * 60 * 1000,
      cooldownDuration: 30 * 1000,
    });
    jwksCache.set(url, jwks);
  }
  return jwks;
}

export class AuthError extends Error {
  constructor(
    readonly reason: string,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function verifyToken(env: Env, token: string): Promise<AuthUser> {
  let payload: Record<string, unknown>;
  try {
    const result = await jwtVerify(token, getJwks(env), {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
      algorithms: ['ES256'],
      clockTolerance: 5,
    });
    payload = result.payload as Record<string, unknown>;
  } catch (err) {
    if (err instanceof joseErrors.JWTExpired) {
      throw new AuthError('token_expired', 'Your session has expired. Sign in again.');
    }
    throw new AuthError('invalid_token', 'Could not verify your session.');
  }

  const sub = payload.sub;
  if (typeof sub !== 'string' || sub.length === 0) {
    throw new AuthError('invalid_token', 'Token carries no subject.');
  }
  if (payload.role !== 'authenticated') {
    throw new AuthError('invalid_token', 'Token is not a user session.');
  }

  return {
    id: sub,
    email: typeof payload.email === 'string' ? payload.email : null,
    role: payload.role,
  };
}

export function bearerFrom(header: string | undefined | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(
  async (c, next) => {
    const token = bearerFrom(c.req.header('Authorization'));
    if (!token) {
      return c.json(
        { error: 'unauthorized', message: 'Sign in to continue.' },
        401,
        { 'WWW-Authenticate': 'Bearer' },
      );
    }

    try {
      c.set('user', await verifyToken(c.env, token));
    } catch (err) {
      const reason = err instanceof AuthError ? err.reason : 'invalid_token';
      const message = err instanceof AuthError ? err.message : 'Could not verify your session.';
      return c.json({ error: reason, message }, 401, { 'WWW-Authenticate': 'Bearer' });
    }

    await next();
  },
);
