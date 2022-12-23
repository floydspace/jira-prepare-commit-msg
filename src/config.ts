import { cosmiconfig } from 'cosmiconfig';
import { debug, error } from './log';

export type JPCMConfig = {
  allowEmptyCommitMessage: boolean;
  conventionalCommitPattern: string; // Conventional Commit RegExp
  ignoredBranchesPattern: string;
  ignoreBranchesMissingTickets: boolean;
  jiraTicketPattern: string; // JIRA ticket RexExp
};

const defaultConfig = {
  allowEmptyCommitMessage: false,
  ignoredBranchesPattern: '^(master|main|dev|develop|development|release)$',
  ignoreBranchesMissingTickets: false,
  conventionalCommitPattern: '^([a-z]+)(?:\\(([a-z0-9.,-_ ]+)\\))?!?: ([\\w \\S]+)$',
  jiraTicketPattern: '([A-Z]+-\\d+)',
} as JPCMConfig;

function resolveConfig(configPath: string): string {
  try {
    return require.resolve(configPath);
  } catch {
    return configPath;
  }
}

export async function loadConfig(configPath?: string): Promise<JPCMConfig> {
  try {
    const explorer = cosmiconfig('jira-prepare-commit-msg', {
      searchPlaces: [
        'package.json',
        '.jirapreparecommitmsgrc',
        '.jirapreparecommitmsgrc.json',
        '.jirapreparecommitmsgrc.yaml',
        '.jirapreparecommitmsgrc.yml',
        'jira-prepare-commit-msg.config.js',
      ],
    });

    const config = configPath ? await explorer.load(resolveConfig(configPath)) : await explorer.search();

    debug(`Loaded config: ${JSON.stringify(config)}`);

    if (config && !config.isEmpty) {
      const result = { ...defaultConfig, ...config.config };
      debug(`Used config: ${JSON.stringify(result)}`);
      return result as JPCMConfig;
    }
  } catch (err) {
    error(`Loading configuration failed with error: ${err}`);
  }

  const result = { ...defaultConfig };
  debug(`Used config: ${JSON.stringify(result)}`);
  return result;
}
