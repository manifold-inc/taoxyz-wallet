# taoxyz-wallet

## Required programs

- web-ext https://github.com/mozilla/web-ext
- bun https://bun.sh/docs/installation

## Build Environment:

Macos ARM (M4 pro max)

To install bun

```
curl -fsSL https://bun.sh/install | bash -s bun-v1.2.18
```

To install node dependencies:

## Build

```bash
bun i
```

To compile:

```
bun run build
```

Dist will be in `./dists/firefox_zip`

## Chrome

To Run

```bash
bun run index.ts
```
