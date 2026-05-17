# Contributing

Thanks for considering a contribution to Oksigenia web libs.

## Quickstart

```sh
git clone https://github.com/OksigeniaSL/oksigenia-web-libs.git
cd oksigenia-web-libs
pnpm install
pnpm build
pnpm test
```

Workspace layout uses [pnpm workspaces](https://pnpm.io/workspaces):

```
packages/
├── share/          → @oksigenia/share
└── access-panel/   → @oksigenia/access-panel
```

Each package builds with [tsup](https://tsup.egoist.dev/) and tests
with [Vitest](https://vitest.dev/) (DOM stubbed by
[happy-dom](https://github.com/capricorn86/happy-dom)).

## Workflow

1. Open an issue first for non-trivial changes — it saves us all time.
2. Fork, branch from `main`.
3. Code with tests. New behavior without tests will not be merged.
4. `pnpm test` and `pnpm typecheck` must pass.
5. Add a [changeset](https://github.com/changesets/changesets):
   `pnpm changeset` — describe the change and pick a version bump.
6. Open a PR. CI runs the same checks; reviewer responds within a few days.

## Code style

- TypeScript strict, no `any`, no `// @ts-ignore`. Use precise types.
- No runtime dependencies in the published packages. If a feature
  needs one, discuss it in an issue first.
- Single quotes, two-space indent, trailing commas. The codebase has
  no enforced formatter (yet) — match what's around your change.
- Comments explain **why**, not **what**. Skip comments that just
  restate the next line.

## Accessibility bar

The whole reason these libs exist is privacy + a11y. Any change to
`@oksigenia/access-panel` must:

- Preserve the existing 15 controls and their semantics.
- Keep keyboard navigation working (focus trap, Escape closes,
  `aria-pressed` reflected).
- Respect `prefers-reduced-motion`.
- Not introduce a runtime dependency.

## Localization

Both packages ship inline dictionaries. To add a locale:

- `@oksigenia/share` → add an entry to `packages/share/src/translations.ts`.
- `@oksigenia/access-panel` → add an entry to `packages/access-panel/src/translations.ts`.

Update the typed `LocaleCode` union and the README locale table in
the same PR.

We are especially happy to take native-speaker contributions for
under-served languages, including Indigenous languages of the
Americas.

## Releases

Maintainers publish via:

```sh
pnpm changeset version   # bumps packages + writes changelog
pnpm changeset publish   # builds + publishes to npm
```

Contributors don't need to publish — just include a changeset in the PR.

## License

By contributing, you agree your contributions are licensed under
the [MIT License](./LICENSE).
