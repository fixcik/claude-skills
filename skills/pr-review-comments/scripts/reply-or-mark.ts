#!/usr/bin/env node
/**
 * Unified script for:
 * 1. Replying to single/multiple comments
 * 2. Resolving threads
 * 3. Marking comments locally (done/skip/later)
 *
 * Usage:
 *   # Reply to single comment
 *   reply-or-mark.ts thread "THREAD_ID" "Your reply" --resolve --status=done
 *
 *   # Mark locally only (no reply)
 *   reply-or-mark.ts thread "THREAD_ID" --status=done --note="Fixed"
 *   reply-or-mark.ts nitpick "file:line" --status=skip --note="False positive"
 *
 *   # Batch from JSON file
 *   reply-or-mark.ts batch comments.json --sequential
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface State {
  pr: string;
  updatedAt: string;
  threads: Record<string, { status: string; note?: string }>;
  nitpicks: Record<string, { status: string; note?: string }>;
}

interface Comment {
  id: string; // threadId or nitpickId
  type: 'thread' | 'nitpick';
  reply?: string;
  resolve?: boolean;
  status?: string;
  note?: string;
}

function getStatePath(): string | null {
  try {
    const prInfo = JSON.parse(execSync('gh pr view --json number,url', { encoding: 'utf8' }));
    const parts = prInfo.url.replace('https://github.com/', '').split('/');
    const owner = parts[0];
    const repo = parts[1];
    const number = prInfo.number;

    const dir = path.join(process.env.HOME || '', '.cursor', 'reviews', `${owner}-${repo}-${number}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, 'pr-state.json');
  } catch {
    return null;
  }
}

function loadState(statePath: string): State {
  if (fs.existsSync(statePath)) {
    try {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch {
      return { pr: '', updatedAt: new Date().toISOString(), threads: {}, nitpicks: {} };
    }
  }
  return { pr: '', updatedAt: new Date().toISOString(), threads: {}, nitpicks: {} };
}

function saveState(statePath: string, state: State): void {
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function markComment(state: State, comment: Comment): void {
  if (!comment.status) return;

  if (comment.type === 'nitpick') {
    state.nitpicks[comment.id] = { status: comment.status, note: comment.note };
  } else {
    state.threads[comment.id] = { status: comment.status, note: comment.note };
  }
}

function runGhGraphql(query: string, variables: Record<string, any>): any {
  try {
    const cmd = `gh api graphql --input - <<'EOF'\n${JSON.stringify({ query, variables })}\nEOF`;
    const result = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const parsed = JSON.parse(result);
    if (parsed.errors) throw new Error(JSON.stringify(parsed.errors));
    return parsed;
  } catch (error: any) {
    throw error;
  }
}

async function processComment(comment: Comment, state: State): Promise<{ ok: boolean; error?: string }> {
  try {
    // Reply if provided
    if (comment.reply && comment.type === 'thread') {
      const replyQuery = `
        mutation($threadId: ID!, $body: String!) {
          addPullRequestReviewThreadReply(input: {
            pullRequestReviewThreadId: $threadId
            body: $body
          }) {
            comment { id url }
          }
        }
      `;
      runGhGraphql(replyQuery, { threadId: comment.id, body: comment.reply });
      console.log(`  💬 Replied to ${comment.id.substring(0, 20)}...`);
    }

    // Resolve if requested
    if (comment.resolve && comment.type === 'thread') {
      const resolveQuery = `
        mutation($threadId: ID!) {
          resolveReviewThread(input: { threadId: $threadId }) {
            thread { isResolved }
          }
        }
      `;
      runGhGraphql(resolveQuery, { threadId: comment.id });
      console.log(`  🔒 Resolved ${comment.id.substring(0, 20)}...`);
    }

    // Mark locally
    if (comment.status) {
      markComment(state, comment);
      console.log(`  📌 Marked as ${comment.status}`);
    }

    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const statePath = getStatePath();
  const state = statePath ? loadState(statePath) : { pr: '', updatedAt: '', threads: {}, nitpicks: {} };

  // Parse "thread THREAD_ID" or "nitpick ID" or "batch file.json"
  const mode = args[0];

  if (!mode || (mode !== 'thread' && mode !== 'nitpick' && mode !== 'batch')) {
    console.error(`Usage:`);
    console.error(`  # Single comment`);
    console.error(`  reply-or-mark.ts thread THREAD_ID [REPLY] [--resolve] [--status=done] [--note=TEXT]`);
    console.error(`  reply-or-mark.ts nitpick FILE:LINE [--status=skip] [--note=TEXT]`);
    console.error(`  `);
    console.error(`  # Batch from JSON`);
    console.error(`  reply-or-mark.ts batch file.json [--sequential]`);
    console.error(`  cat file.json | reply-or-mark.ts batch`);
    process.exit(1);
  }

  try {
    if (mode === 'batch') {
      // Batch processing
      let inputFile: string | null = args[1];
      let sequential = args.includes('--sequential');

      let comments: Comment[];

      if (inputFile && fs.existsSync(inputFile)) {
        const content = fs.readFileSync(inputFile, 'utf8');
        comments = JSON.parse(content);
      } else if (!inputFile || inputFile === '-') {
        // Read from stdin
        let input = '';
        process.stdin.setEncoding('utf8');
        await new Promise((resolve) => {
          process.stdin.on('data', (chunk) => {
            input += chunk;
          });
          process.stdin.on('end', () => resolve(undefined));
        });
        comments = JSON.parse(input);
      } else {
        console.error(`File not found: ${inputFile}`);
        process.exit(1);
      }

      console.log(`📝 Processing ${comments.length} comments...\n`);
      let succeeded = 0;
      let failed = 0;

      if (sequential) {
        for (let i = 0; i < comments.length; i++) {
          const comment = comments[i];
          process.stdout.write(`[${i + 1}/${comments.length}] `);
          const result = await processComment(comment, state);

          if (result.ok) {
            succeeded++;
            console.log(`✅`);
          } else {
            failed++;
            console.log(`❌ ${result.error}`);
          }

          if (i < comments.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      } else {
        // Parallel with concurrency limit
        const concurrency = 3;
        for (let i = 0; i < comments.length; i += concurrency) {
          const batch = comments.slice(i, i + concurrency);
          const results = await Promise.all(batch.map((c) => processComment(c, state)));
          results.forEach((r, idx) => {
            const label = `[${i + idx + 1}/${comments.length}]`;
            if (r.ok) {
              console.log(`${label} ✅`);
              succeeded++;
            } else {
              console.log(`${label} ❌ ${r.error}`);
              failed++;
            }
          });
        }
      }

      console.log(`\n📊 Summary: ${succeeded} OK, ${failed} failed`);

      if (statePath) {
        saveState(statePath, state);
        console.log(`💾 State saved to ${statePath}`);
      }

      if (failed > 0) process.exit(1);
    } else {
      // Single comment (thread or nitpick)
      const id = args[1];
      const reply = !args[2]?.startsWith('--') ? args[2] : undefined;

      if (!id) {
        console.error(`Error: ${mode.toUpperCase()}_ID required`);
        process.exit(1);
      }

      let resolve = false;
      let status: string | undefined;
      let note: string | undefined;

      for (const arg of args.slice(reply ? 3 : 2)) {
        if (arg === '--resolve') {
          resolve = true;
        } else if (arg.startsWith('--status=')) {
          status = arg.split('=')[1];
        } else if (arg.startsWith('--note=')) {
          note = arg.split('=')[1];
        }
      }

      const comment: Comment = {
        id,
        type: mode as 'thread' | 'nitpick',
        reply,
        resolve,
        status,
        note
      };

      console.log(`Processing ${mode}: ${id.substring(0, 30)}...`);
      const result = await processComment(comment, state);

      if (!result.ok) {
        console.error(`❌ Error: ${result.error}`);
        process.exit(1);
      }

      if (statePath) {
        saveState(statePath, state);
        console.log(`✅ Done! State saved.`);
      } else {
        console.log(`✅ Done!`);
      }
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
