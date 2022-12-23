import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { JPCMConfig } from './config';
import { debug } from './log';

const gitVerboseStatusSeparator = '------------------------ >8 ------------------------';

function escapeReplacement(str: string): string {
  return str.replace(/[$]/, '$$$$'); // In replacement to escape $ needs $$
}

function findFirstLineToInsert(lines: string[]): number {
  let firstNotEmptyLine = -1;

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    // ignore everything after "#" or the scissors comment, which present when doing a --verbose commit,
    // or `git config commit.status true`
    if (line === gitVerboseStatusSeparator) {
      break;
    }

    if (line.startsWith('#')) {
      continue;
    }

    if (firstNotEmptyLine === -1) {
      firstNotEmptyLine = i;
      break;
    }
  }

  return firstNotEmptyLine;
}

function clearMessage(message: string) {
  const messageSections = message.split(gitVerboseStatusSeparator)[0];
  const cleanLines = messageSections
    .trim()
    .split('\n')
    .map((line) => line.trimStart())
    .filter((line) => !line.startsWith('#'));

  return cleanLines.join('\n').trim();
}

function insertJiraTicketIntoMessage(message: string, jiraTicket: string, config: JPCMConfig): string {
  const cleanMessage = clearMessage(message);

  const lines = message.split('\n').map((line) => line.trimStart());

  if (!cleanMessage.length) {
    debug(`User didn't write the message. Allow empty commit is ${String(config.allowEmptyCommitMessage)}`);

    const preparedMessage = `chore(${jiraTicket}): wip`;

    if (message.length > 0) {
      const insertedMessage = config.allowEmptyCommitMessage
        ? preparedMessage
        : `# ${preparedMessage}\n` +
          '# JIRA prepare commit msg > ' +
          'Please uncomment the line above if you want to insert JIRA ticket into commit message';

      lines.unshift(insertedMessage);
    } else {
      if (config.allowEmptyCommitMessage) {
        lines.unshift(preparedMessage);
      } else {
        debug('Commit message is empty. Skipping...');
      }
    }

    return lines.join('\n');
  }

  const firstLineToInsert = findFirstLineToInsert(lines);

  debug(`First line to insert is: ${firstLineToInsert > -1 ? lines[firstLineToInsert] : ''} (${firstLineToInsert})`);

  if (firstLineToInsert !== -1) {
    const line = lines[firstLineToInsert];

    debug(`Finding conventional commit in: ${line}`);
    const conventionalCommitRegExp = new RegExp(config.conventionalCommitPattern, 'g');
    conventionalCommitRegExp.lastIndex = -1;
    let [match, type, scope, msg] = conventionalCommitRegExp.exec(line) ?? [];

    if (!match) {
      match = `chore: ${line}`;
      type = 'chore';
      scope = '';
      msg = line;
    }

    debug(`Conventional commit message: ${match}`);

    if (!scope?.includes(jiraTicket)) {
      const newScope = scope ? `${scope}, ${jiraTicket}` : jiraTicket;
      lines[firstLineToInsert] = `${type}(${newScope}): ${msg}`;
    }
  }

  // Add jira ticket into the message in case of missing
  if (lines.every((line) => !line.includes(jiraTicket))) {
    lines[0] = `chore(${jiraTicket}): ${escapeReplacement(lines[0] || '')}`;
  }

  return lines.join('\n');
}

export function getBranchName(): string {
  const cwd = process.cwd();
  const args = ['--git-dir', path.join(cwd, '.git'), 'symbolic-ref', '--short', 'HEAD'];

  const { status, stderr, stdout } = cp.spawnSync('git', args, { cwd, encoding: 'utf-8' });

  if (status !== 0) {
    throw new Error(stderr.toString());
  }

  return stdout.toString().trim();
}

export function getJiraTicket(branchName: string, config: JPCMConfig): string | null {
  debug('getJiraTicket');

  const jiraIdPattern = new RegExp(config.jiraTicketPattern, 'i');
  const matched = jiraIdPattern.exec(branchName);
  const jiraTicket = matched && matched[0];

  return jiraTicket ? jiraTicket.toUpperCase() : null;
}

export function writeJiraTicket(jiraTicket: string, config: JPCMConfig): void {
  debug('writeJiraTicket');

  const messageFilePath = path.join(process.cwd(), '.git', 'COMMIT_EDITMSG');
  let message: string;

  // Read file with commit message
  try {
    message = fs.readFileSync(messageFilePath, { encoding: 'utf-8' });
  } catch (ex) {
    throw new Error(`Unable to read the file "${messageFilePath}".`);
  }

  const messageWithJiraTicket = insertJiraTicketIntoMessage(message, jiraTicket, config);
  debug(messageWithJiraTicket);

  // Write message back to file
  try {
    fs.writeFileSync(messageFilePath, messageWithJiraTicket, { encoding: 'utf-8' });
  } catch (ex) {
    throw new Error(`Unable to write the file "${messageFilePath}".`);
  }
}
