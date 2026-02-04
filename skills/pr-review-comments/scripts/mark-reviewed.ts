import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface State {
  pr: string;
  updatedAt: string;
  threads: Record<string, { status: string; note?: string }>;
  nitpicks: Record<string, { status: string; note?: string }>;
}

function getStatePath(owner: string, repo: string, number: number): string {
  const dir = path.join(process.env.HOME || '', '.cursor', 'reviews', `${owner}-${repo}-${number}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'pr-state.json');
}

function loadState(statePath: string): State {
  if (fs.existsSync(statePath)) {
    try {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch (e) {}
  }
  return { pr: '', updatedAt: new Date().toISOString(), threads: {}, nitpicks: {} };
}

function saveState(statePath: string, state: State) {
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function main() {
  const args = process.argv.slice(2);
  let type = '';
  let id = '';
  let status = '';
  let note = '';
  let owner = '';
  let repo = '';
  let number = 0;

  // Simple arg parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === 'thread' || arg === 'nitpick') {
      type = arg;
      id = args[++i];
      status = args[++i];
      note = args[++i] || '';
    } else if (arg.startsWith('https://github.com/')) {
      const parts = arg.replace('https://github.com/', '').split('/');
      owner = parts[0];
      repo = parts[1];
      number = parseInt(parts[3], 10);
    }
  }

  if (!type || !id || !status) {
    console.error('Usage: npx tsx mark-reviewed.ts <type: thread|nitpick> <id> <status: done|skip|later> [note] [PR_URL]');
    process.exit(1);
  }

  if (!owner || !repo || !number) {
    try {
      const prInfo = JSON.parse(execSync('gh pr view --json number,url', { encoding: 'utf8' }));
      const parts = prInfo.url.replace('https://github.com/', '').split('/');
      owner = parts[0];
      repo = parts[1];
      number = prInfo.number;
    } catch (e) {
      console.error('Error: Could not determine PR context. Please provide PR URL as an argument.');
      process.exit(1);
    }
  }

  const statePath = getStatePath(owner, repo, number);
  const state = loadState(statePath);
  state.pr = `${owner}/${repo}#${number}`;

  if (type === 'thread') {
    state.threads[id] = { status, note };
  } else if (type === 'nitpick') {
    state.nitpicks[id] = { status, note };
  } else {
    console.error('Error: Type must be "thread" or "nitpick"');
    process.exit(1);
  }

  saveState(statePath, state);
  console.log(`Marked ${type} ${id} as ${status} in ${statePath}`);
}

main();
