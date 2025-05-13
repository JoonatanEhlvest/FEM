/**
 * Utility functions for text wrapping
 */

// Default padding in pixels to add to text measurements
const DEFAULT_TEXT_PADDING = 0;

/**
 * Creates a canvas text context for measuring text width
 */
function createTextMeasurer(
	fontFamily: string,
	fontSize: number
): CanvasRenderingContext2D | null {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (ctx) {
		ctx.font = `${fontSize}px ${fontFamily}`;
	}

	return ctx;
}

/**
 * Finds the last non-letter character in a string
 */
function findLastNonLetterPosition(text: string): number {
	let lastPos = -1;

	for (let i = 0; i < text.length; i++) {
		if (!/[a-zA-Z]/.test(text[i])) {
			lastPos = i;
		}
	}

	return lastPos;
}

/**
 * Breaks a long word that doesn't fit in the available width
 */
function breakLongWord(
	word: string,
	maxWidth: number,
	ctx: CanvasRenderingContext2D,
	padding: number = DEFAULT_TEXT_PADDING
): { firstPart: string; remainingPart: string } {
	let partialWord = "";
	let remainingWord = word;

	// Account for padding
	const effectiveMaxWidth = maxWidth - padding;

	// Build up the word character by character until it's too wide
	for (let j = 0; j < word.length; j++) {
		const nextChar = word[j];
		const testPartial = partialWord + nextChar;
		if (ctx.measureText(testPartial).width > effectiveMaxWidth) {
			break;
		}
		partialWord += nextChar;
		remainingWord = word.substring(j + 1);
	}

	// If we have part of the word, and it's getting split
	if (partialWord && partialWord.length < word.length) {
		// Find the last non-letter character in the partial word
		const lastNonLetterPos = findLastNonLetterPosition(partialWord);

		// If found, split after the non-letter character
		if (lastNonLetterPos >= 0) {
			partialWord = word.substring(0, lastNonLetterPos + 1);
			remainingWord = word.substring(lastNonLetterPos + 1);
		}
	}

	return { firstPart: partialWord, remainingPart: remainingWord };
}

/**
 * Wraps text into multiple lines based on maximum width
 * Preserves word boundaries when possible
 *
 * @param text - The text to wrap
 * @param maxWidth - Maximum width in pixels for each line
 * @param fontFamily - Font family to use
 * @param fontSize - Font size in pixels
 * @param padding - Optional padding in pixels (default: 4px)
 * @returns Array of wrapped text lines
 */
export function wrapText(
	text: string,
	maxWidth: number,
	fontFamily = "Arial, sans-serif",
	fontSize: number,
	padding: number = DEFAULT_TEXT_PADDING
): string[] {
	// Create canvas for measuring text
	const ctx = createTextMeasurer(fontFamily, fontSize);

	if (!ctx) {
		// Fallback if canvas context is not available
		return fallbackWrapText(
			text,
			estimateMaxCharsPerWidth(maxWidth - padding, fontSize)
		);
	}

	// Account for padding
	const effectiveMaxWidth = maxWidth - padding;

	// Quick return for short text
	if (ctx.measureText(text).width <= effectiveMaxWidth) {
		return [text];
	}

	const words = text.split(/\s+/);
	const lines: string[] = [];
	let currentLine = "";

	// Process each word
	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		const testLine = currentLine ? `${currentLine} ${word}` : word;
		const testWidth = ctx.measureText(testLine).width;

		// Check if the word fits in the current line
		if (testWidth <= effectiveMaxWidth) {
			currentLine = testLine;
			continue;
		}

		// If the current line is not empty, add it to the lines array and start a new line with the current word
		if (currentLine) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			// If the current line is empty, we need to handle a word that's too long to fit in one line
			const { firstPart, remainingPart } = breakLongWord(
				word,
				maxWidth,
				ctx,
				padding
			);

			// Add as much of the word as fits
			if (firstPart) {
				lines.push(firstPart);
				// Put the rest back for processing in the next iteration
				words.splice(i + 1, 0, remainingPart);
			} else {
				// Edge case: even a single character doesn't fit
				lines.push(word);
			}
		}
	}

	// Add the last line
	if (currentLine) {
		lines.push(currentLine);
	}

	return lines;
}

/**
 * Fallback text wrapping function that uses estimated character width
 * Used when canvas isn't available
 *
 * @param text - The text to wrap
 * @param maxCharsPerLine - Maximum characters per line
 * @returns Array of wrapped text lines
 */
function fallbackWrapText(text: string, maxCharsPerLine: number): string[] {
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
 * Estimate the maximum number of characters that can fit in a given width
 * Used as a fallback when canvas measurement isn't available
 *
 * @param width - Available width in pixels
 * @param fontSize - Font size in pixels
 * @returns Estimated maximum number of characters that can fit
 */
function estimateMaxCharsPerWidth(width: number, fontSize: number): number {
	// Estimate average character width
	const avgCharWidth = fontSize * 0.5;
	// Calculate how many characters can fit in the available width
	return Math.max(1, Math.floor(width / avgCharWidth));
}
