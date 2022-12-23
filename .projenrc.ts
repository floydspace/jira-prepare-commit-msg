import { ArrowParens, NodePackageManager, TrailingComma } from 'projen/lib/javascript';
import { TypeScriptProject } from 'projen/lib/typescript';

const name = 'jira-prepare-conventional-commit-msg';
const description = 'Husky Git hook to add JIRA ticket ID into the scope of conventional commit message';
const version = '1.0.0';

const project = new TypeScriptProject({
  name,
  description,
  defaultReleaseBranch: 'master',
  license: 'MIT',
  copyrightOwner: 'Victor Korzunin',
  authorName: 'Dmitry Shilov',
  keywords: ['husky', 'jira', 'hook', 'hooks', 'prepare', 'conventional', 'commit', 'message', 'msg'],
  homepage: `https://github.com/floydspace/${name}`,
  repository: `https://github.com/floydspace/${name}`,
  bin: { [name]: 'lib/index.js' },
  deps: ['cosmiconfig'],
  devDeps: ['ava', 'rimraf', 'esbuild'],
  packageManager: NodePackageManager.NPM,
  jest: false,
  github: false,
  clobber: false,
  package: true,
  projenrcTs: true,
  disableTsconfig: true,
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
});

project.eslint?.addExtends('eslint:recommended', 'plugin:@typescript-eslint/recommended');

const clearTask = project.addTask('clear', {
  exec: 'rimraf lib dist',
});
const typeCheckTask = project.addTask('type-check', {
  exec: 'tsc --noEmit --project tsconfig.dev.json',
});

project.preCompileTask.spawn(clearTask);
project.preCompileTask.spawn(typeCheckTask);
project.preCompileTask.spawn(project.tasks.tryFind('eslint')!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
project.compileTask.reset('esbuild --bundle --minify src/index.ts --platform=node --packages=external --outdir=lib');

project.testTask.reset();
project.testTask.say('No unit tests yet');

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
integrationTestTask.exec('ava test/test.ts');
integrationTestTask.exec('cd ./test/husky2 && rimraf .git && rimraf node_modules');
integrationTestTask.exec('cd ./test/husky3 && rimraf .git && rimraf node_modules');
integrationTestTask.exec('cd ./test/husky4 && rimraf .git && rimraf node_modules');
integrationTestTask.exec('cd ./test/husky5 && rimraf .git && rimraf node_modules && rimraf .husky');

project.package.addField('ava', {
  extensions: ['ts'],
  require: ['ts-node/register'],
});

project.package.addVersion(version);

project.addPackageIgnore('.editorconfig');
project.addPackageIgnore('.gitattributes');
project.addPackageIgnore('.nvmrc');
project.addPackageIgnore('.prettierignore');
project.addPackageIgnore('.prettierrc.json');
project.addPackageIgnore('.projenrc.ts');

const publishTask = project.addTask('publish', {
  exec: `npm publish dist/js/${project.name}-${version}.tgz`,
});

publishTask.prependSpawn(project.buildTask);

project.synth();
