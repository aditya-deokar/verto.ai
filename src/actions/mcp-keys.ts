'use server'

import { randomBytes } from 'crypto'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

// ─── Constants ─────────────────────────────────────────────────
const API_KEY_PREFIX = 'vk_live_'
const KEY_RANDOM_BYTES = 20 // 40 hex chars
const BCRYPT_COST = 12
const MAX_KEYS_PER_USER = 5

// ─── Types ─────────────────────────────────────────────────────

export interface McpApiKeyInfo {
  id: string
  name: string
  keyPrefix: string
  createdAt: Date
  lastUsedAt: Date | null
  isRevoked: boolean
}

// ─── Helpers ───────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string | null> {
  const user = await currentUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  })

  return dbUser?.id ?? null
}

// ─── Actions ───────────────────────────────────────────────────

/**
 * Generate a new MCP API key.
 * Returns the plaintext key ONCE — it is never stored or retrievable again.
 */
export async function generateMcpApiKey(name: string) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { status: 403, error: 'Unauthorized' }

    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length > 50) {
      return { status: 400, error: 'Key name must be 1-50 characters.' }
    }

    // Enforce per-user limit
    const existingCount = await prisma.mcpApiKey.count({
      where: { userId, isRevoked: false },
    })
    if (existingCount >= MAX_KEYS_PER_USER) {
      return {
        status: 400,
        error: `Maximum ${MAX_KEYS_PER_USER} active keys allowed. Revoke an existing key first.`,
      }
    }

    // Generate the plaintext key
    const randomPart = randomBytes(KEY_RANDOM_BYTES).toString('hex')
    const plaintextKey = `${API_KEY_PREFIX}${randomPart}`
    const keyPrefix = plaintextKey.substring(0, 12)

    // Hash the key for storage
    const keyHash = await hash(plaintextKey, BCRYPT_COST)

    // Store in database
    await prisma.mcpApiKey.create({
      data: {
        userId,
        name: trimmedName,
        keyHash,
        keyPrefix,
      },
    })

    revalidatePath('/settings')

    return {
      status: 200,
      data: {
        plaintextKey, // Shown to user ONCE, never stored
        keyPrefix,
        name: trimmedName,
      },
    }
  } catch (error) {
    console.error('Failed to generate MCP API key:', error)
    return { status: 500, error: 'Failed to generate API key' }
  }
}

/**
 * List all MCP API keys for the authenticated user.
 * Never returns the hash — only metadata and prefix.
 */
export async function listMcpApiKeys() {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { status: 403, error: 'Unauthorized' }

    const keys = await prisma.mcpApiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
        lastUsedAt: true,
        isRevoked: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { status: 200, data: keys as McpApiKeyInfo[] }
  } catch (error) {
    console.error('Failed to list MCP API keys:', error)
    return { status: 500, error: 'Failed to fetch API keys' }
  }
}

/**
 * Revoke an MCP API key (soft-disable, keeps history).
 */
export async function revokeMcpApiKey(keyId: string) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { status: 403, error: 'Unauthorized' }

    // Verify ownership
    const key = await prisma.mcpApiKey.findFirst({
      where: { id: keyId, userId },
    })
    if (!key) return { status: 404, error: 'API key not found' }

    if (key.isRevoked) {
      return { status: 200, message: 'Key is already revoked' }
    }

    await prisma.mcpApiKey.update({
      where: { id: keyId },
      data: { isRevoked: true },
    })

    revalidatePath('/settings')
    return { status: 200, message: 'API key revoked successfully' }
  } catch (error) {
    console.error('Failed to revoke MCP API key:', error)
    return { status: 500, error: 'Failed to revoke API key' }
  }
}

/**
 * Permanently delete an MCP API key.
 */
export async function deleteMcpApiKey(keyId: string) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { status: 403, error: 'Unauthorized' }

    // Verify ownership
    const key = await prisma.mcpApiKey.findFirst({
      where: { id: keyId, userId },
    })
    if (!key) return { status: 404, error: 'API key not found' }

    await prisma.mcpApiKey.delete({
      where: { id: keyId },
    })

    revalidatePath('/settings')
    return { status: 200, message: 'API key deleted successfully' }
  } catch (error) {
    console.error('Failed to delete MCP API key:', error)
    return { status: 500, error: 'Failed to delete API key' }
  }
}
