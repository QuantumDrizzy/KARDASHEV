# Contributing to KARDASHEV

KARDASHEV gets better when someone proves a number wrong. Corrections, missing modules and broken
assumptions are all welcome. The rules are short, and they are the ones the project already holds
itself to.

## Before you open a pull request

```bash
npm install
npm test          # every physics lock must stay green
```

## The rules

- **A number needs a source.** Every value in `src/lib/` either cites where it comes from (a dataset,
  a paper, a report, with year) or is labeled as an assumption. If you change a number, change its test
  and put the citation in the test's comment.
- **First-order physics, stated.** Models are simple on purpose and say what they leave out. A
  `[KNOWN_LIMIT]` in the code or the test is better than a hidden one.
- **Watts first.** A claim about intelligence, compute or growth is a claim about power and heat;
  write it in those units.
- **No partners, no endorsements.** Companies and programs are observed and cited, never promoted.
- **Offline.** No external APIs, no CDN, no tracking. The instrument runs on a laptop with no network.

## What helps most

- A correction to a number, with its source.
- A missing module: write it as pure TypeScript in `src/lib/` with its test, following an existing one
  (`docs/NEXT-MODULES.md` lists the open ones).
- An assumption shown wrong by a better first-order model.

## Licence and ownership

KARDASHEV is maintained by its author, who sets its doctrine and direction and decides what is
merged. The project is published under MIT OR Apache-2.0 (see `README.md`).

Before a first pull request is merged, its author signs the [Contributor License Agreement](CLA.md)
by posting one comment on the pull request; the CLA assistant asks for it and records it. You keep the
rights to your work; the agreement lets the maintainer license the project as a whole, including your
contribution, in one place.
