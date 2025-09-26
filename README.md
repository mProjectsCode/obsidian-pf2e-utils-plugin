# PF2E Utils

A plugin for [Obsidian](https://obsidian.md) that add various utilities for managing [Pathfinder Second Edition](https://paizo.com/pathfinder) content in Obsidian.

## Features

### Inline Checks

The plugin adds support for the [inline check syntax](https://github.com/foundryvtt/pf2e/wiki/Style-Guide#inline-check-links) from the [PF2E System](https://github.com/foundryvtt/pf2e) for [Foundry VTT](https://foundryvtt.com/).

Inline code blocks staring with `@Check` are recognized and transformed to natural language in reading mode. These [inline checks](https://github.com/foundryvtt/pf2e/wiki/Style-Guide#inline-check-links) can provide information about the difficulty, if the note has a `level` front-matter property.

Examples:

- `@Check[fortitude|dc:20|basic]` -> `Basic DC 20 Fortitude`
- `@Check[flat|dc:4]` -> `DC 4 Flat`

#### Inline Check Builder

The plugin adds a `Open PF2E Check Builder` command that offers a simple UI for building [inline checks](https://github.com/foundryvtt/pf2e/wiki/Style-Guide#inline-check-links).

### Inline Rolls

Support planed.

### Conversion of Natural Language Checks

The plugins offers two commands `Open PF1E Check Finder` and `Open PF2E Check Finder` that allow you to quickly find all occurrences of natural language checks for either PF1E or PF2E, and convert them to PF2E [inline checks](https://github.com/foundryvtt/pf2e/wiki/Style-Guide#inline-check-links). Natural language checks are checks in the form `DC 15 Acrobatics` or `Perception DC 20`.

For PF1E, the plugin implements a conversion UI to easily convert checks to PF2E. This conversion relies on a `level` front-matter property.

## Feature Requests

Feature requests and PRs are welcome, but I want to keep this plugin small. This means I will be picky about what features will be implemented
