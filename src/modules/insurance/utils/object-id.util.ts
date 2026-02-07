/**
 * Utility functions for ObjectId conversion
 */

/**
 * Convert MongoDB document with ObjectId to plain object with string ID
 */
export function convertObjectIdToString<T extends { _id: any }>(item: T): Omit<T, '_id'> & { _id: string } {
  const { _id, ...rest } = item;
  return {
    _id: _id.toString(),
    ...rest,
  } as Omit<T, '_id'> & { _id: string };
}

/**
 * Convert array of MongoDB documents
 */
export function convertObjectIdsToString<T extends { _id: any }>(items: T[]): (Omit<T, '_id'> & { _id: string })[] {
  return items.map(convertObjectIdToString);
}
