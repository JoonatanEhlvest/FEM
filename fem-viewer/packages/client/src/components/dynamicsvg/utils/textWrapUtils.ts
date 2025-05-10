/**
 * Utility functions for text wrapping
 */

/**
 * Wraps text into multiple lines based on maximum characters per line
 * Preserves word boundaries when possible
 *
 * @param text - The text to wrap
 * @param maxCharsPerLine - Maximum number of characters per line
 * @returns Array of wrapped text lines
 */
export function wrapText(text: string, maxCharsPerLine: number): string[] {
	// Quick return for short text
	if (text.length <= maxCharsPerLine) {
		return [text];
	}

	// Split by whitespace to get words
	const words = text.split(/(\s+)/);
	const lines: string[] = [];
	let currentLine = "";

	// Process each word
	for (let i = 0; i < words.length; i++) {
		const word = words[i];

		// If adding this word would exceed the line length
		if ((currentLine + word).length > maxCharsPerLine) {
			// If the current line already has content, push it and start a new line
			if (currentLine.length > 0) {
				lines.push(currentLine.trim());
				currentLine = word;
			}
			// If the word itself is longer than the line length
			else if (word.length > maxCharsPerLine) {
				// Try to find a good split point at non-letter characters
				let splitIndex = -1;
				for (let j = maxCharsPerLine; j > 0; j--) {
					if (!/[a-zA-Z]/.test(word[j])) {
						splitIndex = j + 1;
						break;
					}
				}

				// If no good split point found, fall back to maxCharsPerLine
				if (splitIndex === -1) {
					splitIndex = maxCharsPerLine;
				}

				// Split the word at the found position
				lines.push(word.substring(0, splitIndex));
				currentLine = word.substring(splitIndex);
			} else {
				currentLine = word;
			}
		} else {
			// Add the word to the current line
			currentLine += word;
		}
	}

	// Don't forget the last line if there's anything left
	if (currentLine.length > 0) {
		lines.push(currentLine.trim());
	}

	return lines;
}

/**
 * Calculate the maximum number of characters that can fit in a given width
 *
 * @param width - Available width in pixels
 * @param fontSize - Font size in pixels
 * @param padding - Optional padding to subtract from width (default: 10)
 * @returns Maximum number of characters that can fit
 */
export function calculateMaxCharsPerWidth(
	width: number,
	fontSize: number,
	padding: number = 10
): number {
	// Estimate average character width (approximately 0.6 of the font size)
	const avgCharWidth = fontSize * 0.5;
	// Calculate how many characters can fit in the available width
	return Math.max(1, Math.floor((width - padding) / avgCharWidth));
}

// TODO: This should be reworked to create a tspan elements without having to estimate the average character width
// https://www.petercollingridge.co.uk/tutorials/svg/multi-line-text-box/
