# ARITHMIX

A math puzzle game where you arrange numbers into equation templates to hit target values.

## Play Now

🎮 **[Play ARITHMIX](https://mynumbers.onrender.com)**

## Features

- **Practice Mode**: Solve puzzles at your own pace 
- **Rush Mode**: Race against the clock (3-min or 5-min challenges)
- **Inside ARITHMIX:** Explore the math and data structures behind the game.

## How to Play

1. You're given a target number and an equation template with operators
2. Drag numbers from the bank into the empty slots
3. Make the equation equal the target number
4. In Rush Mode, solve as many as you can before time runs out!

## Local Development

This is a TypeScript project with an Express server, a React client (bundled
with webpack), and a Vite library build. You need [Node.js](https://nodejs.org/)
(v18+).

```bash
# Install dependencies
npm install

# Build the server and client, then start the app
npm run build
npm start
```

Then open http://localhost:8000/ (set `PORT` to use a different port).


## Using ARITHMIX as a library

The game and explainer can be embedded in another app. `npm run build:lib`
produces an ESM + UMD bundle (`dist/lib`) with type declarations.
`react`, `react-dom`, and `styled-components` are peer dependencies that the
host app provides.

React host:

```tsx
import { Arithmix, GamePage, ExplainerPage } from "arythmix"

// Full app with built-in routing between the game and explainer:
<Arithmix />

// Or embed an individual page:
<GamePage />
<ExplainerPage />
```

