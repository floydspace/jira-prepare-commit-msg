import { ArrowParens, NodePackageManager, TrailingComma } from 'projen/lib/javascript';
import { TypeScriptProject } from 'projen/lib/typescript';

const project = new TypeScriptProject({
  defaultReleaseBranch: 'master',
  name: 'jira-prepare-conventional-commit-msg',
  description: 'Husky Git hook to add JIRA ticket ID into the scope of conventional commit message',
  license: 'MIT',
  copyrightOwner: 'Victor Korzunin',
  authorName: 'Dmitry Shilov',
  keywords: ['husky', 'jira', 'hook', 'hooks', 'prepare', 'conventional', 'commit', 'message', 'msg'],
  homepage: 'https://github.com/floydspace/jira-prepare-conventional-commit-msg',
  repository: 'https://github.com/floydspace/jira-prepare-conventional-commit-msg',
  projenrcTs: true,
  deps: ['cosmiconfig'],
  devDeps: ['ava', 'rimraf'],
  packageManager: NodePackageManager.NPM,
  jest: false,
  github: false,
  clobber: false,
  bin: {
    'jira-prepare-conventional-commit-msg': 'lib/index.js',
  },
  prettier: true,
  prettierOptions: {
    settings: {
      arrowParens: ArrowParens.ALWAYS,
      bracketSpacing: true,
      printWidth: 120,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: TrailingComma.ALL,
    },
  },
  package: false,
});

project.eslint?.addExtends('eslint:recommended', 'plugin:@typescript-eslint/recommended');

project.preCompileTask.exec('rimraf lib');

const integrationTestTask = project.addTask('integration-test');
integrationTestTask.exec(
  'cd ./test/husky2 && git init && git checkout -b JIRA-4321-test-husky2 && npm i --no-package-lock',
);
integrationTestTask.exec(
  'cd ./test/husky3 && git init && git checkout -b JIRA-4321-test-husky3 && npm i --no-package-lock',
);
integrationTestTask.exec(
  'cd ./test/husky4 && git init && git checkout -b JIRA-4321-test-husky4 && npm i --no-package-lock',
);
integrationTestTask.exec(
  'cd ./test/husky5 && git init && git checkout -b JIRA-4321-test-husky5 && npm i --no-package-lock',
);
integrationTestTask.exec('npx ava test/test.ts');
integrationTestTask.exec('cd ./test/husky2 && rimraf .git && rimraf node_modules');
integrationTestTask.exec('cd ./test/husky3 && rimraf .git && rimraf node_modules');
integrationTestTask.exec('cd ./test/husky4 && rimraf .git && rimraf node_modules');
integrationTestTask.exec('cd ./test/husky5 && rimraf .git && rimraf node_modules && rimraf .husky');

project.package.addField('ava', {
  extensions: ['ts'],
  require: ['ts-node/register'],
});

project.synth();
