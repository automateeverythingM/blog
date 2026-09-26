import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getReadingTimeMinutes } from './readingTime.ts';

function words(count: number): string[] {
	return Array.from({ length: count }, (_, i) => `word${i}`);
}

test('a 200-word body is exactly 1 minute', () => {
	assert.equal(getReadingTimeMinutes(words(200).join(' ')), 1);
});

test('a 250-word body rounds up to 2 minutes', () => {
	assert.equal(getReadingTimeMinutes(words(250).join(' ')), 2);
});

test('a 400-word body is exactly 2 minutes, not rounded up further', () => {
	assert.equal(getReadingTimeMinutes(words(400).join(' ')), 2);
});

test('an empty string is 1 minute (minimum floor)', () => {
	assert.equal(getReadingTimeMinutes(''), 1);
});

test('a whitespace-only string is 1 minute (minimum floor)', () => {
	assert.equal(getReadingTimeMinutes('   \n\t  '), 1);
});

test('a short body of a few words is 1 minute (minimum floor)', () => {
	assert.equal(getReadingTimeMinutes('just a few words'), 1);
});

test('counts words correctly across irregular whitespace without counting empty tokens', () => {
	const text = `  ${words(200).join('  \n\t ')}  `;
	assert.equal(getReadingTimeMinutes(text), 1);
});
