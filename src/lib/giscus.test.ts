import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isGiscusConfigured } from './giscus.ts';

const fullConfig = {
	repo: 'automateeverythingM/blog',
	repoId: 'R_kgDOexample',
	category: 'Announcements',
	categoryId: 'DIC_kwDOexample',
};

test('is configured when every setting is filled in', () => {
	assert.equal(isGiscusConfigured(fullConfig), true);
});

test('is not configured when repoId is empty', () => {
	assert.equal(isGiscusConfigured({ ...fullConfig, repoId: '' }), false);
});

test('is not configured when category is empty', () => {
	assert.equal(isGiscusConfigured({ ...fullConfig, category: '' }), false);
});

test('is not configured when categoryId is empty', () => {
	assert.equal(isGiscusConfigured({ ...fullConfig, categoryId: '' }), false);
});

test('is not configured when repo is empty', () => {
	assert.equal(isGiscusConfigured({ ...fullConfig, repo: '' }), false);
});

test('is not configured when nothing is filled in', () => {
	assert.equal(isGiscusConfigured({ repo: '', repoId: '', category: '', categoryId: '' }), false);
});
