import sanitizeHtml from 'sanitize-html';

/**
 * Calculate estimated reading time for a given text
 * @param text The content to calculate reading time for
 * @param wordsPerMinute Average reading speed (default: 200 words per minute)
 * @returns Formatted reading time string
 */
export default function calculateReadingTime(
  text: string,
  wordsPerMinute: number = 200,
): string {
  // Sanitize the input text to remove all HTML tags and markdown syntax
  const cleanText = sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Count words by splitting on whitespace
  const words = cleanText.trim().split(/\s+/).length;

  // Calculate reading time in minutes
  const minutes = Math.ceil(words / wordsPerMinute);

  // Format the reading time
  if (minutes < 1) {
    return "Less than a minute";
  } else if (minutes === 1) {
    return "1 minute";
  } else {
    return `${minutes} minutes`;
  }
}
