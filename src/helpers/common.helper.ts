/**
 * Normalizes a filename by replacing spaces with underscores, truncating the
 * name to fit within a 20 character limit, and appending a timestamp to ensure
 * uniqueness.
 *
 * @param {string} str - The original filename.
 * @returns {string} The normalized filename.
 * @throws {Error} If the file extension cannot be determined.
 */
const normalizeFilename = (str: string): string => {
  const originalName = str.replaceAll(/\s/g, '_');
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.slice(0, originalName.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(
    0,
    20 - ((extension?.length || 0) + 1),
  );
  const timestamp = Date.now();

  if (!extension) {
    throw new Error('Failed to determine file extension');
  }

  return `${timestamp}_${truncatedName}.${extension}`;
};

export { normalizeFilename };
