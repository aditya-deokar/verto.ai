/**
 * MCP Cursor-Based Pagination Utilities
 *
 * Stable pagination using cursor encoding.
 * Immune to insertions/deletions during pagination.
 */

import { PAGINATION } from '../../config/constants';

export interface PaginationMeta {
  next_cursor: string | null;
  has_more: boolean;
  total_count: number;
  page_size: number;
}

interface CursorPayload {
  id: string;
  v: number; // cursor version for future-proofing
}

/**
 * Encode a cursor from a record ID.
 */
export function encodeCursor(id: string): string {
  const payload: CursorPayload = { id, v: 1 };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * Decode a cursor back to a record ID.
 * Returns null if the cursor is invalid or malformed.
 */
export function decodeCursor(cursor: string): string | null {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const payload: CursorPayload = JSON.parse(raw);

    if (!payload.id || typeof payload.id !== 'string') {
      return null;
    }

    return payload.id;
  } catch {
    return null;
  }
}

/**
 * Clamp page size to allowed range.
 */
export function clampPageSize(requested?: number): number {
  const size = requested ?? PAGINATION.DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.min(size, PAGINATION.MAX_PAGE_SIZE));
}

/**
 * Build Prisma cursor-based pagination args.
 *
 * We fetch `limit + 1` records to determine if there are more results.
 */
export function buildPrismaCursorArgs(cursor?: string, limit?: number) {
  const pageSize = clampPageSize(limit);
  const decodedCursorId = cursor ? decodeCursor(cursor) : null;

  return {
    take: pageSize + 1, // fetch one extra to check for more
    pageSize,
    ...(decodedCursorId
      ? {
          skip: 1, // skip the cursor record itself
          cursor: { id: decodedCursorId },
        }
      : {}),
  };
}

/**
 * Build PaginationMeta from a result set.
 *
 * @param results - The fetched results (may include the extra "peek" record)
 * @param pageSize - The requested page size
 * @param totalCount - Total count of matching records
 */
export function buildPaginationMeta<T extends { id: string }>(
  results: T[],
  pageSize: number,
  totalCount: number
): { items: T[]; pagination: PaginationMeta } {
  const hasMore = results.length > pageSize;
  const items = hasMore ? results.slice(0, pageSize) : results;
  const lastItem = items[items.length - 1];

  return {
    items,
    pagination: {
      next_cursor: hasMore && lastItem ? encodeCursor(lastItem.id) : null,
      has_more: hasMore,
      total_count: totalCount,
      page_size: pageSize,
    },
  };
}
