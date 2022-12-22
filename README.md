# jira-prepare-conventional-commit-msg

[![Downloads](https://img.shields.io/npm/dm/jira-prepare-conventional-commit-msg)](https://www.npmjs.com/package/jira-prepare-conventional-commit-msg)
[![MIT license](https://img.shields.io/npm/l/jira-prepare-conventional-commit-msg)](http://opensource.org/licenses/MIT)

The husky command to add JIRA ticket ID into the scope of conventional commit message if it is missed.

The JIRA ticket ID is taken from a git branch name.

## Why?

Installing Jira prepare commit msg hook into your project will mean everyone contributing code to your project will automatically tag each commit with
it's associated issue key based off the branch name.

So if your branch name is `feature/TEST-123-new-feature`, then when you commit with a message `"initial commit"` it will automatically become `"chore(TEST-123): initial commit"`.

Why would you want this? Well, Jira has many hidden goodies, and this is one of them! If you include an issue key in your commit messages AND you have your deployment pipeline connected to Jira this will unlock many bonus features, such as the Deployments view, Cycle time report, Deployment frequency report and etc.

Additionally, when you use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) you will get a nice commit history and clean changelog.

## Installation

Install the package using NPM

```bash
npm install husky jira-prepare-conventional-commit-msg --save-dev && npx husky install
```

For Husky 5:

Execute command

```shell
npx husky add .husky/prepare-commit-msg 'npx jira-prepare-conventional-commit-msg $1'
```

For Husky 2-4:

Inside your package.json add a standard husky npm script for the git hook

```json
{
  "husky": {
    "hooks": {
      "prepare-commit-msg": "jira-prepare-conventional-commit-msg"
    }
  }
}
```

## Configuration

Starting with v1.3 you can now use different ways of configuring it:

- `jira-prepare-commit-msg` object in your `package.json`
- `.jirapreparecommitmsgrc` file in JSON or YML format
- `jira-prepare-commit-msg.config.js` file in JS format

See [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for more details on what formats are supported.

#### `package.json` example:

```json
{
  "jira-prepare-commit-msg": {
    "jiraTicketPattern": "([A-Z]+-\\d+)",
    "conventionalCommitPattern": "^([a-z]+)(?:\\(([a-z0-9.,-_ ]+)\\))?!?: ([\\w \\S]+)$",
    "allowEmptyCommitMessage": false,
    "ignoredBranchesPattern": "^(master|main|dev|develop|development|release)$",
    "ignoreBranchesMissingTickets": false
  }
}
```

#### Supported JIRA ticket pattern

`jira-prepare-conventional-commit-msg` allows using custom regexp string pattern to search JIRA ticket number.

Pattern `([A-Z]+-\\d+)` is currently supported by default.

**NOTE:** to search JIRA ticket pattern flag `i` is used: `new RegExp(pattern, i')`

```json
{
  "jira-prepare-commit-msg": {
    "jiraTicketPattern": "([A-Z]+-\\d+)"
  }
}
```

#### Allow empty commit message

The commit message might be empty after cleanup or using `-m ""`, `jira-prepare-conventional-commit-msg` might insert the JIRA ticket number anyway if this flag is set.

```json
{
  "jira-prepare-commit-msg": {
    "allowEmptyCommitMessage": true
  }
}
```

#### Ignoring branches

Branches can be ignored and skipped by regex pattern string

```json
{
  "jira-prepare-commit-msg": {
    "ignoredBranchesPattern": "^main|develop|(maint-.*)$"
  }
}
```

Moreover, this can be solved by replacing the Husky hook. Put in your prepare-commit-msg file (husky git hook):

```shell
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

if [[ "$(git rev-parse --abbrev-ref HEAD)" =~ YOUR_BRANCH_REGEX ]]; then
npx --no-install jira-prepare-conventional-commit-msg $1
fi
```

where `YOUR_BRANCH_REGEX` e.g. `^(feature|(bug|hot)fix)\/[A-Z]+-[0-9]+$`

#### Silently ignore any branch that does not have a jira ticket in it

Be silent and skip any branch with missing jira ticket

```json
{
  "jira-prepare-commit-msg": {
    "ignoreBranchesMissingTickets": true
  }
}
```

#### Conventional commit

`jira-prepare-conventional-commit-msg` natively works with [conventional commit](https://www.conventionalcommits.org).

##### Examples

If the commit message is `fix(test)!: important changes` then at result will be `fix(test, JIRA-1234)!: important changes`.

Additionally, you can **customize the conventional commit format** with the following setting:

```json
{
  "jira-prepare-commit-msg": {
    "conventionalCommitPattern": "^([a-z]+)(?:\\(([a-z0-9.,-_ ]+)\\))?!?: ([\\w \\S]+)$"
  }
}
```

The above regular expression is the default conventional commit pattern so, if you don't provide this property, `jira-prepare-conventional-commit-msg` will use this by default.

In the default regular expression, from left to right:

- `([a-z]+)` is the commit `type`.
- `(?:\\(([a-z0-9.,-_ ]+)\\))?!?` is the commit `scope`.
- And `([\\w \\S]+)` is the commit `subject`.

With this setting you can change how `jira-prepare-conventional-commit-msg` reads your custom conventional commit message and rewrites it properly adding the Jira ticket id in the `scope`.

##### Examples

You can allow the scope to have capital letters adding A-Z to the regular expression above. If the configuration is:

```json
{
  "jira-prepare-commit-msg": {
    "conventionalCommitPattern": "^([a-z]+)(?:\\(([a-zA-Z0-9.,-_ ]+)\\))?!?: ([\\w \\S]+)$"
    //                                                ^^^
    //                 Now we can use capital letters in the conventional commit scope
  }
}
```

and commit message is "`test(E2E): some end-to-end testing stuff`" then at result will be "`test(E2E, JIRA-1234): some end-to-end testing stuff`"

Be aware that if you leave the default `conventionalCommitPattern` value (that it not allows capital letters in the commit scope) in the example above, your resulting message will be "`chore(JIRA-1234): test(E2E): some end-to-end testing stuff`". Maybe, this is not the result you are expecting and you can have problems using other tools like [commitlint](https://commitlint.js.org/).

## License

MIT
