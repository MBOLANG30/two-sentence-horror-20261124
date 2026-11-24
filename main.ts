// Two-Sentence Horror — make.fun entry
// Writes one original two-sentence horror story to $MAKEFUN_OUTPUT_DIR/entry.txt
// (fallback /output). No network, no reads outside this repo, no deletion of
// anything: the grader mounts the output directory, so we only ever create
// entry.txt inside it.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The story. Sentence one is a mundane neighbourly complaint; sentence two
// reframes it: the footsteps were never mine, and I am not the only one here.
const STORY =
  "The woman downstairs knocked to ask me to stop pacing at night, because my footsteps keep her awake. " +
  "I have used a wheelchair since the accident, and I live alone.";

// Count Unicode code points, not UTF-16 code units, so the 400-char gate
// matches what the scorer measures.
function charCount(text: string): number {
  return [...text].length;
}

// Split on sentence-ending punctuation followed by whitespace (or the end),
// keeping the terminator with its sentence. A valid story has exactly two
// non-empty sentences.
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function main(): void {
  const story = STORY;

  if (story.trim().length === 0) {
    fail("story is empty or whitespace-only");
  }
  if (story.includes("\n") || story.includes("\r")) {
    fail("story must be a single line with no newline characters");
  }

  const length = charCount(story);
  if (length < 1 || length > 400) {
    fail(`story is ${length} characters; the gate allows 1 to 400`);
  }

  const sentences = splitSentences(story);
  if (sentences.length !== 2) {
    fail(`story has ${sentences.length} sentences; exactly 2 are required`);
  }
  for (const sentence of sentences) {
    if (!/[.!?]$/.test(sentence)) {
      fail(`sentence does not end with terminal punctuation: ${sentence}`);
    }
    // Each sentence must carry real prose, not just punctuation or digits.
    if (!/[A-Za-z]/.test(sentence)) {
      fail(`sentence has no letters: ${sentence}`);
    }
  }
  // No stray double spaces or trailing space: every word earns its place.
  if (/  /.test(story) || story !== story.trim()) {
    fail("story has double spaces or leading/trailing whitespace");
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), story, "utf8");
  console.log(`wrote ${length} characters, 2 sentences, to ${join(outDir, "entry.txt")}`);
}

main();
