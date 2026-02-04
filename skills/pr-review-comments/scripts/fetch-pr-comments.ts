import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface State {
  pr: string;
  updatedAt: string;
  threads: Record<string, { status: string; note?: string }>;
  nitpicks: Record<string, { status: string; note?: string }>;
}

interface ThreadComment {
  id: string;
  body: string;
  author: { login: string };
  url: string;
  createdAt: string;
  path: string;
  line: number | null;
}

interface Thread {
  id: string;
  isResolved: boolean;
  isOutdated: boolean;
  path: string;
  line: number | null;
  comments: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: ThreadComment[];
  };
}

interface PRData {
  repository: {
    pullRequest: {
      number: number;
      title: string;
      state: string;
      author: { login: string };
      isDraft: boolean;
      mergeable: string;
      reviewThreads: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: Thread[];
      };
      files: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: Array<{
          path: string;
          additions: number;
          deletions: number;
          changeType: string;
        }>;
      };
      reviews: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: Array<{
          author: { login: string };
          body: string;
          url: string;
          state: string;
          bodyText: string;
        }>;
      };
      comments: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: Array<{
          id: string;
          body: string;
          author: { login: string };
          url: string;
          createdAt: string;
        }>;
      };
    };
  };
}

function runGh(args: string[]): any {
  try {
    const command = `gh ${args.join(' ')}`;
    const output = execSync(command, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(output);
  } catch (error: any) {
    console.error(`Error running gh command: ${error.message}`);
    process.exit(1);
  }
}

interface Args {
  owner: string;
  repo: string;
  number: number;
  showAll: boolean;
  only: string[];
  includeDone: boolean;
  withResolved: boolean;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let owner = '';
  let repo = '';
  let number = 0;
  let showAll = false;
  let only: string[] = [];
  let includeDone = false;
  let withResolved = false;

  for (const arg of args) {
    if (arg.startsWith('https://github.com/')) {
      const parts = arg.replace('https://github.com/', '').split('/');
      owner = parts[0];
      repo = parts[1];
      if (parts[2] === 'pull') {
        number = parseInt(parts[3], 10);
      }
    } else if (arg.startsWith('--owner=')) {
      owner = arg.split('=')[1];
    } else if (arg.startsWith('--repo=')) {
      repo = arg.split('=')[1];
    } else if (arg.startsWith('--number=')) {
      number = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--all') {
      showAll = true;
    } else if (arg === '--include-done') {
      includeDone = true;
    } else if (arg === '--with-resolved') {
      withResolved = true;
    } else if (arg.startsWith('--only=')) {
      only = arg.split('=')[1].split(',').map(s => s.trim());
    }
  }

  if (!owner || !repo || !number) {
    try {
      const prInfo = JSON.parse(execSync('gh pr view --json number,url', { encoding: 'utf8' }));
      const parts = prInfo.url.replace('https://github.com/', '').split('/');
      owner = parts[0];
      repo = parts[1];
      number = prInfo.number;
    } catch (e) {
      console.error('Usage: npx tsx fetch-pr-comments.ts <PR_URL> [--all] [--include-done] [--with-resolved] [--only=threads,nitpicks,files,summaries,userComments]');
      process.exit(1);
    }
  }

  return { owner, repo, number, showAll, only, includeDone, withResolved };
}

interface Nitpick {
  id: string;
  path: string;
  line: string;
  content: string;
  status?: string;
}

function getNitpickId(filePath: string, line: string, content: string): string {
  if (filePath && line && filePath !== 'unknown' && !filePath.toLowerCase().includes('comments')) {
    return `${filePath}:${line}`;
  }
  return crypto.createHash('sha1').update(content).digest('hex').substring(0, 8);
}

function getStatePath(owner: string, repo: string, number: number): string {
  const dir = path.join(process.env.HOME || '', '.cursor', 'reviews', `${owner}-${repo}-${number}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'pr-state.json');
}

function findBalancedDetails(body: string, summaryFilter?: RegExp): { full: string, content: string, summary: string }[] {
  const results: { full: string, content: string, summary: string }[] = [];
  const detailsStartRegex = /<details[\s>]/g;
  let match;

  while ((match = detailsStartRegex.exec(body)) !== null) {
    const startPos = match.index;
    let depth = 1;
    let currentPos = match.index + match[0].length;

    while (depth > 0 && currentPos < body.length) {
      const nextOpen = body.indexOf('<details', currentPos);
      const nextClose = body.indexOf('</details>', currentPos);

      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        currentPos = nextOpen + 8;
      } else {
        depth--;
        currentPos = nextClose + 10;
      }
    }

    if (depth === 0) {
      const fullBlock = body.substring(startPos, currentPos);
      const summaryMatch = fullBlock.match(/<summary>([\s\S]*?)<\/summary>/);
      const summary = summaryMatch ? summaryMatch[1] : '';

      if (!summaryFilter || summaryFilter.test(summary)) {
        const summaryEndTag = '</summary>';
        const summaryEndIndex = fullBlock.indexOf(summaryEndTag);
        const content = summaryEndIndex !== -1
          ? fullBlock.substring(summaryEndIndex + summaryEndTag.length, fullBlock.length - 10).trim()
          : '';

        results.push({ full: fullBlock, content, summary });
      }

      detailsStartRegex.lastIndex = currentPos;
    }
  }
  return results;
}

function loadState(statePath: string): State {
  if (fs.existsSync(statePath)) {
    try {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch (e) {}
  }
  return { pr: '', updatedAt: '', threads: {}, nitpicks: {} };
}

function parseNitpicks(body: string): Nitpick[] {
  const nitpicks: Nitpick[] = [];
  const sections = findBalancedDetails(body, /(Nitpick|Additional) comments/);

  for (const section of sections) {
    const fileBlocks = findBalancedDetails(section.content);
    for (const fileBlock of fileBlocks) {
      const summaryMatch = fileBlock.summary.match(/(.*?) \((\d+)\)/);
      if (!summaryMatch) continue;

      const filePath = summaryMatch[1].trim();
      const fileContent = fileBlock.content.replace(/^<blockquote>\s*/, '').replace(/\s*<\/blockquote>$/, '');
      const commentRegex = /`(\d+(?:-\d+)?)`:\s*([\s\S]*?)(?=`\d+|$)/g;
      let commentMatch;

      while ((commentMatch = commentRegex.exec(fileContent)) !== null) {
        const line = commentMatch[1];
        const content = commentMatch[2].trim();
        nitpicks.push({
          id: getNitpickId(filePath, line, content),
          path: filePath,
          line: line,
          content: content
        });
      }
    }
  }
  return nitpicks;
}

function cleanCommentBody(body: string): string {
  const preservedSections = findBalancedDetails(body, /(Nitpick|Additional) comments/);
  const preserved = preservedSections.map(s => s.full);

  let cleaned = body
    .replace(/<details>\s*<summary>🧩 Analysis chain<\/summary>[\s\S]*?<\/details>/g, '')
    .replace(/<details>\s*<summary>🤖 Prompt for AI Agents<\/summary>[\s\S]*?<\/details>/g, '')
    .replace(/<!-- internal state start -->[\s\S]*?<!-- internal state end -->/g, '')
    .replace(/<details>\s*<summary>❤️ Share<\/summary>[\s\S]*?<\/details>/g, '')
    .replace(/## Sequence Diagram\(s\)[\s\S]*?(?=##|$)/g, '')
    .replace(/## Changes[\s\S]*?(?=##|$)/g, '')
    .replace(/## Poem[\s\S]*?(?=##|$)/g, '')
    .replace(/## Estimated code review effort[\s\S]*?(?=##|$)/g, '')
    .replace(/<details>\s*<summary>📜 Recent review details<\/summary>[\s\S]*?(?=<details>\s*<summary>.*?Additional comments|<details>\s*<summary>.*?Nitpick comments|<!--|$)/g, '')
    .replace(/<sub>✏️ Tip:[\s\S]*?<\/sub>/g, '')
    .replace(/Thanks for using \[CodeRabbit\][\s\S]*/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  for (const p of preserved) {
    const summaryMatch = p.match(/<summary>([\s\S]*?)<\/summary>/);
    if (summaryMatch && !cleaned.includes(summaryMatch[0])) {
      cleaned += '\n\n### Preserved Comments\n' + p;
    }
  }

  const MAX_LENGTH = 15000;
  if (cleaned.length > MAX_LENGTH) {
    return cleaned.substring(0, MAX_LENGTH) + '\n\n... [TRUNCATED] ...';
  }
  return cleaned;
}

async function fetchAllPages(owner: string, repo: string, number: number, queryPattern: string, getNodes: (pr: any) => any, getPageInfo: (pr: any) => any): Promise<any[]> {
  const allNodes: any[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const ghArgs = [
      'api', 'graphql',
      `-F owner="${owner}"`,
      `-F repo="${repo}"`,
      `-F number=${number}`,
      cursor ? `-F after="${cursor}"` : '',
      `-f query='${queryPattern}'`
    ].filter(Boolean);

    const result = runGh(ghArgs);
    const pr = result.data.repository.pullRequest;

    allNodes.push(...getNodes(pr));
    const pageInfo = getPageInfo(pr);
    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }
  return allNodes;
}

async function fetchAllThreadComments(owner: string, repo: string, number: number, thread: Thread): Promise<ThreadComment[]> {
  const comments = [...thread.comments.nodes];
  let cursor = thread.comments.pageInfo.endCursor;
  let hasNextPage = thread.comments.pageInfo.hasNextPage;

  while (hasNextPage && cursor) {
    const query = `
      query($owner: String!, $repo: String!, $number: Int!, $threadId: String!, $after: String) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            reviewThread(id: $threadId) {
              comments(first: 50, after: $after) {
                pageInfo { hasNextPage endCursor }
                nodes { id body author { login } url createdAt path line }
              }
            }
          }
        }
      }
    `;

    const ghArgs = [
      'api', 'graphql',
      `-F owner="${owner}"`,
      `-F repo="${repo}"`,
      `-F number=${number}`,
      `-F threadId="${thread.id}"`,
      `-F after="${cursor}"`,
      `-f query='${query}'`
    ];

    const result = runGh(ghArgs);
    const threadData = result.data.repository.pullRequest.reviewThread;
    if (!threadData) break;

    comments.push(...threadData.comments.nodes);
    hasNextPage = threadData.comments.pageInfo.hasNextPage;
    cursor = threadData.comments.pageInfo.endCursor;
  }
  return comments;
}

async function main() {
  const { owner, repo, number, showAll, only, includeDone, withResolved } = parseArgs();
  const filter = (key: string) => only.length === 0 || only.includes(key);
  const statePath = getStatePath(owner, repo, number);
  const state = loadState(statePath);

  // 1. Fetch review threads
  const threadsQuery = `
    query($owner: String!, $repo: String!, $number: Int!, $after: String) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          reviewThreads(first: 50, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id isResolved isOutdated path line
              comments(first: 50) {
                pageInfo { hasNextPage endCursor }
                nodes { id body author { login } url createdAt path line }
              }
            }
          }
        }
      }
    }
  `;
  const allThreads: Thread[] = await fetchAllPages(owner, repo, number, threadsQuery, pr => pr.reviewThreads.nodes, pr => pr.reviewThreads.pageInfo);

  // 2. Fetch files
  const filesQuery = `
    query($owner: String!, $repo: String!, $number: Int!, $after: String) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          files(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { path additions deletions changeType }
          }
        }
      }
    }
  `;
  const allFiles = filter('files') ? await fetchAllPages(owner, repo, number, filesQuery, pr => pr.files.nodes, pr => pr.files.pageInfo) : [];

  // 3. Fetch reviews
  const reviewsQuery = `
    query($owner: String!, $repo: String!, $number: Int!, $after: String) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          reviews(first: 50, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { author { login } body url state }
          }
        }
      }
    }
  `;
  const allReviews = await fetchAllPages(owner, repo, number, reviewsQuery, pr => pr.reviews.nodes, pr => pr.reviews.pageInfo);

  // 4. Fetch general comments
  const commentsQuery = `
    query($owner: String!, $repo: String!, $number: Int!, $after: String) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          comments(first: 50, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { id body author { login } url createdAt }
          }
        }
      }
    }
  `;
  const allComments = await fetchAllPages(owner, repo, number, commentsQuery, pr => pr.comments.nodes, pr => pr.comments.pageInfo);

  // 5. Get PR Meta
  const metaResult = runGh(['api', 'graphql', `-F owner="${owner}"`, `-F repo="${repo}"`, `-F number=${number}`, `-f query='query($owner: String!, $repo: String!, $number: Int!) { repository(owner: $owner, name: $repo) { pullRequest(number: $number) { number title state author { login } isDraft mergeable } } }'`]);
  const pr = metaResult.data.repository.pullRequest;
  const prMeta = { ...pr, author: pr.author.login, files: allFiles };

  // 6. Process Threads
  const processedThreads = [];
  if (filter('threads')) {
    for (const t of allThreads) {
      if (!showAll && !withResolved && t.isResolved) continue;
      const threadStatus = state.threads[t.id]?.status;
      if (!includeDone && (threadStatus === 'done' || threadStatus === 'skip')) continue;

      const comments = await fetchAllThreadComments(owner, repo, number, t);
      processedThreads.push({
        thread_id: t.id,
        isResolved: t.isResolved,
        isOutdated: t.isOutdated,
        path: t.path,
        line: t.line,
        status: threadStatus,
        comments: comments.map(c => ({
          id: c.id,
          author: c.author.login,
          body: cleanCommentBody(c.body),
          url: c.url,
          createdAt: c.createdAt
        }))
      });
    }
  }

  // 7. Process Bot Summaries
  const botSummaries = [];
  if (filter('summaries') || filter('nitpicks')) {
    const bots = ['coderabbitai', 'github-actions', 'sonarqubecloud'];
    const candidates = [...allComments, ...allReviews].filter(c => bots.includes(c.author?.login));
    for (const c of candidates) {
      let nitpicks = parseNitpicks(c.body);
      if (filter('nitpicks')) {
        nitpicks = nitpicks.map(n => ({ ...n, status: state.nitpicks[n.id]?.status }))
          .filter(n => includeDone || (n.status !== 'done' && n.status !== 'skip'));
      }
      const result: any = { author: c.author.login, url: c.url };
      if (filter('summaries')) result.body = cleanCommentBody(c.body);
      if (filter('nitpicks')) result.nitpicks = nitpicks;
      if (result.body || (result.nitpicks && result.nitpicks.length > 0)) botSummaries.push(result);
    }
  }

  // 8. Process User Comments
  const userComments = [];
  if (filter('userComments')) {
    const bots = ['coderabbitai', 'github-actions', 'sonarqubecloud', 'dependabot'];
    for (const t of allThreads) {
      if (!withResolved && t.isResolved) continue;
      const comments = await fetchAllThreadComments(owner, repo, number, t);
      for (const c of comments) {
        if (!bots.includes(c.author?.login)) {
          userComments.push({
            id: c.id,
            author: c.author?.login,
            body: c.body,
            url: c.url,
            createdAt: c.createdAt,
            thread_id: t.id,
            file: t.path,
            line: t.line,
            isResolved: t.isResolved,
            isOutdated: t.isOutdated
          });
        }
      }
    }
    userComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const output: any = { pr: prMeta, statePath };
  if (filter('threads')) output.threads = processedThreads;
  if (filter('summaries') || filter('nitpicks')) output.botSummaries = botSummaries;
  if (filter('userComments')) output.userComments = userComments;

  output.summary = {
    totalThreads: allThreads.length,
    filteredCount: processedThreads.length,
    unresolvedCount: allThreads.filter(t => !t.isResolved).length,
    resolvedThreadsCount: allThreads.filter(t => t.isResolved).length,
    withResolved,
    botSummariesCount: botSummaries.length,
    nitpicksCount: botSummaries.reduce((acc, s) => acc + (s.nitpicks?.length || 0), 0),
    userCommentsCount: userComments.length,
    userCommentsByAuthor: userComments.reduce((acc, c) => {
      acc[c.author] = (acc[c.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
