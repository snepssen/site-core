# site-core

The pages of the snepssen workshop share four files: the page builder and
the project network every page carries.

| | |
|---|---|
| `build.py` | builds a project's `docs/index.html` from its `docs/page.py`: the chrome is generated, the content is data |
| `ecosystem.json` | the projects: name, page, where each runs (`support`: per system, `runs`, `tested` (CI passes there, not used by hand) or `untested`; the card's platform line and the contact card's untested sentence are written from it), blurb, accent, and, where one piece is made from another, its relationships. Adding a project is one entry here, and its accent in `ecosystem.css` |
| `ecosystem.css`, `ecosystem.js` | the project rail, the progress bar and the network grid |

They were kept byte-identical across eight repositories by hand. This is their
one source now. A project's `docs/` keeps a copy, so its page works on its
own, but the copy is an artifact of this repository and is never edited where
it lands.

    ./sync.sh "what changed"   # into every project beside this one: copy, rebuild, check, commit, push
    ./sync.sh --check          # does every project's copy match?

Both follow `ecosystem.json`. There is no second list. A project checked out
beside this one, with a `docs/` directory, is included. One that is not
checked out is named and left; one with no `docs/` yet has no page to sync
and is passed over.

Every project also pulls from here by itself: its
`.github/workflows/workshop-pages.yml` runs this repository's reusable
`sync-pages.yml` once a day (or on demand from its Actions tab), with its own
token. That workflow does not name the repositories it serves, so a change
pushed here reaches every page within a day even when nobody runs `sync.sh`.

A project whose `docs/` has uncommitted changes is skipped and named, so
nobody's work in progress is swept into a sync. Fonts and each page's own
`style.css` and `page.py` are the project's, and stay there.

## Dependency updates

`.github/workflows/update-dependency.yml` is the other reusable workflow here,
for apps rather than pages. An app's `.github/workflows/dependencies.yml` runs
it once a day (or on demand) with the workshop -cores it builds on, by package
identity, and its own checks:

```yaml
uses: snepssen/site-core/.github/workflows/update-dependency.yml@main
with:
  packages: voice-core speech-core
  package-path: apple
  checks: swift run -q tccheck && swift test
```

It moves each named package to its newest release, runs the checks, and
commits and pushes the new `Package.resolved` only if they pass, as
`voice-core 1.0.5, speech-core 0.5.1`. The packages an app names are updated
together, in one run and one commit, so two updates never race for the same
file. A run started by hand always runs the checks, even with nothing to
update. A core needs no secret: each app updates itself with its own token.

## The workshop script

`ecosystem.json` is also the list of which app builds on which core. A Swift
app's entry has a `swift` block: the folder holding its `Package.swift`, the
cores it `uses`, and its `checks`.

    ./workshop status                       # every folder beside this one, and the core versions each app resolves
    ./workshop check                        # each app's Package.swift and dependencies.yml match ecosystem.json
    ./workshop release speech-core 0.6.0    # test, tag, push; then update, check and push every app that uses it
    ./workshop release voice-core 1.0.5 --dry-run

A Swift app's entry also names its `core` (the non-UI target) and its `check`
executable. `.github/workflows/linux-cores.yml` builds each Core on Ubuntu and
runs its check, weekly and on demand, and writes one table of what compiles:
informational, so a Core that does not build is a finding, not a red run.

`voice-core/scripts/release.sh` and `speech-core/scripts/release.sh` call
`workshop release`. Adding an app, or a core to an app, is its entry here and
the `packages` line of its `dependencies.yml`; `workshop check` says when the
two disagree.

## Licence

MIT, copyright 2026 snepssen. See [LICENSE](LICENSE).

The mark is Flower of Life geometry adapted from Pd4u's [CC0 Wikimedia SVG](https://commons.wikimedia.org/wiki/File:Flower_of_Life_SVG.svg).

Pages generated into other repositories' `docs/` follow those repositories' own licences. MIT permits that.
