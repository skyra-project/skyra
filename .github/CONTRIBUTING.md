# Contributing

**The issue tracker is only for issue reporting or proposals/suggestions. If you have a question, you can find us in our [Discord Server](https://skyra.pw/join)**.

To contribute to this repository, feel free to create a new fork of the repository and
submit a pull request. We highly suggest [ESLint](https://eslint.org/) to be installed
in your text editor or IDE of your choice to avoid fail builds from GitHub Actions.

1. Fork, clone, and select the **master** branch.
2. Create a new branch in your fork.
3. Commit your changes, and push them.
4. Submit a Pull Request [here](https://github.com/kyranet/Skyra/pulls)!

## Skyra Concept Guidelines

There are a number of guidelines considered when reviewing Pull Requests to be merged. _This is by no means an exhaustive list, but here are some things to consider before/while submitting your ideas._

- Skyra should never change klasa's or discordjs's default behavior. Skyra should only add to Klasa and discordjs, and be as consistent as possible with them.
- Everything in Skyra should be generally useful for the majority of users. Don't let that stop you if you've got a good concept though, as your idea still might be a great addition.
- Everything should be shard compliant. If something you are PRing would break when sharding, break other things from supporting sharding, or is incompatible with sharding; then you will need to think of a way to make it work with sharding in mind before it will be accepted/merged.
- Everything should be documented with [TSDocs](https://github.com/microsoft/tsdoc), whether private or not. __If you see a mistake in the docs, please pr a fix.__
- Everything should follow OOP paradigms and generally rely on behavior over state where possible. This generally helps methods be predictable, keeps the codebase simple & understandable, reduces code duplication through abstraction, and leads to efficiency and therefore scalability.
- Everything should follow our ESLint rules as closely as possible, and should pass lint tests even if you must disable a rule for a single line.
- Everything should follow [Discord Bot Best Practices](https://github.com/meew0/discord-bot-best-practices)
