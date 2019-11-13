# Contributing

**The issue tracker is only for issue reporting or proposals/suggestions. If you have a question, you can find us in our [Discord Server](https://skyra.pw/join)**.

To contribute to this repository, feel free to create a new fork of the repository and
submit a pull request. We highly suggest [ESLint](https://eslint.org/) to be installed
in your text editor or IDE of your choice to ensure builds from GitHub Actions do not fail.

1. Fork, clone, and select the **master** branch.
2. Create a new branch in your fork.
3. Make your changes.
4. Commit your changes, and push them.
5. Submit a Pull Request [here](https://github.com/kyranet/Skyra/pulls)!

## Running Skyra locally

To run Skyra locally a few steps should be taken. You can find a more detailed reference in [the README of this repository](https://github.com/kyranet/Skyra#skyra-) but to list the steps shortly:

1. Copy the `config.example.ts` file and rename it to `config.ts`
2. Scroll down to `export const TOKENS = {`
3. At this section enter your own bot's API token. Generally you only need to fill in the DEV token.
```ts
BOT: {
  DEV: '',
  STABLE: ''
},
```

## Skyra Concept Guidelines

There are a number of guidelines considered when reviewing Pull Requests to be merged. _This is by no means an exhaustive list, but here are some things to consider before/while submitting your ideas._

- Skyra should never change klasa's or discordjs's default behavior. Skyra should only add to Klasa and discord.js, and be as consistent as possible with them.
- Everything in Skyra should be generally useful for the majority of users. Don't let that stop you if you've got a good concept though, as your idea still might be a great addition.
- Everything should be shard compliant. If code you put in a pull request would break when sharding, break other things from supporting sharding, or is incompatible with sharding; then you will need to think of a way to make it work with sharding in mind before the pull request will be accepted and merged.
- Everything should be documented with [TSDocs](https://github.com/microsoft/tsdoc), whether private or not. __If you see a mistake in the docs, please submit a fix.__
- Everything should follow [OOP paradigms](https://en.wikipedia.org/wiki/Object-oriented_programming) and generally rely on behaviour over state where possible. This generally helps methods be predictable, keeps the codebase simple and understandable, reduces code duplication through abstraction, and leads to efficiency and therefore scalability.
- Everything should follow our ESLint rules as closely as possible, and should pass lint tests even if you must disable a rule for a single line.
- Everything should follow [Discord Bot Best Practices](https://github.com/meew0/discord-bot-best-practices)
