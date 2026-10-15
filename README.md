# site-core

The pages of the snepssen workshop share four files: the page builder and
the project network every page carries.

| | |
|---|---|
| `build.py` | builds a project's `docs/index.html` from its `docs/page.py`: the chrome is generated, the content is data |
| `ecosystem.json` | the projects: name, page, platforms, blurb, accent. Adding a project is one entry here |
| `ecosystem.css`, `ecosystem.js` | the project rail, the progress bar and the network grid |

They were kept byte-identical across eight repositories by hand. This is their
one source now. A project's `docs/` keeps a copy, so its page works on its
own, but the copy is an artifact of this repository and is never edited where
it lands.

    ./sync.sh "what changed"   # into every project beside this one: copy, rebuild, check, commit, push
    ./sync.sh --check          # does every project's copy match?

Every project also pulls from here by itself: its
`.github/workflows/workshop-pages.yml` runs this repository's reusable
`sync-pages.yml` once a day (or on demand from its Actions tab), with its own
token, so a change pushed here reaches every page within a day even when
nobody runs `sync.sh`.

A project whose `docs/` has uncommitted changes is skipped and named, so
nobody's work in progress is swept into a sync. Fonts and each page's own
`style.css` and `page.py` are the project's, and stay there.
