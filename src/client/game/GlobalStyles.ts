import { createGlobalStyle } from "styled-components"

export const GlobalStyles = createGlobalStyle`
  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background: #e8e8e8;
    margin: 0;
    padding: 10px;
  }

  @media (max-width: 600px) {
    body {
      padding: 6px;
    }
  }

  @keyframes lb-write-in-eq {
    0%   { clip-path: inset(0 100% 0 0); }
    100% { clip-path: inset(0 -40px 0 0); }
  }

  @keyframes lb-write-in {
    0%   { clip-path: inset(0 100% 0 0); }
    100% { clip-path: inset(0 0% 0 0); }
  }

  .home-lb-surface {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    overflow: visible;
  }

  .home-lb-item {
    position: absolute;
    white-space: nowrap;
    line-height: 1;
    padding: 0.4em 12px 0.3em 0;
    clip-path: inset(0 100% 0 0);
    animation: lb-write-in 2.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .home-lb-canvas {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
  }
`
