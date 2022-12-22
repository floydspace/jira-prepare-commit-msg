const verbose = process.argv.find((arg) => arg === '--verbose');

export function debug(message: string): void {
  if (!verbose) {
    return;
  }

  console.log(`JIRA prepare conventional commit msg > DEBUG: ${message}`);
}

export function log(message: string): void {
  console.log(`JIRA prepare conventional commit msg > ${message}`);
}

export function error(err: string): void {
  console.error(`JIRA prepare conventional commit msg > ${err}`);
}
