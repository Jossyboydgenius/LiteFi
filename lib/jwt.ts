import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: 'USER' | 'ADMIN'
  iat?: number
  exp?: number
}

/**
 * Generate JWT token
 * @param payload - Token payload
 * @returns JWT token string
 */
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  
  const secretKey = new TextEncoder().encode(secret)
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  
  // Convert expiry string to seconds
  const expirySeconds = expiresIn === '7d' ? 7 * 24 * 60 * 60 : 24 * 60 * 60
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirySeconds)
    .sign(secretKey)
}

/**
 * Verify JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    
    const secretKey = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, secretKey)
    
    return {
      userId: (payload as any).userId,
      email: (payload as any).email,
      role: (payload as any).role,
      iat: payload.iat,
      exp: payload.exp
    } as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 * @param request - Next.js request object
 * @returns Token string or null
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

/**
 * Extract token from cookies
 * @param request - Next.js request object
 * @returns Token string or null
 */
export function extractTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null
}

/**
 * Get user from request (checks both header and cookies)
 * @param request - Next.js request object
 * @returns User payload or null
 */
export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  // Try to get token from Authorization header first
  let token = extractTokenFromHeader(request)
  
  // If not found, try cookies
  if (!token) {
    token = extractTokenFromCookies(request)
  }
  
  if (!token) {
    return null
  }
  
  return await verifyToken(token)
}

/**
 * Check if user has required role
 * @param user - User payload
 * @param requiredRole - Required role
 * @returns Boolean indicating if user has required role
 */
export function hasRole(user: JWTPayload | null, requiredRole: 'USER' | 'ADMIN'): boolean {
  if (!user) return false
  
  if (requiredRole === 'ADMIN') {
    return user.role === 'ADMIN'
  }
  
  return user.role === 'USER' || user.role === 'ADMIN'
}

/**
 * Check if user has required role (alias for hasRole)
 * @param user - User payload
 * @param requiredRole - Required role
 * @returns Boolean indicating if user has required role
 */
export function checkRole(user: JWTPayload | null, requiredRole: 'USER' | 'ADMIN'): boolean {
  return hasRole(user, requiredRole)
}

/**
 * Create authentication response headers
 * @param token - JWT token
 * @returns Headers object
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    'Set-Cookie': `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`, // 7 days
  }
}