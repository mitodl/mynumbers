import styled from "@emotion/styled"
import { css } from "@emotion/react"

/**
 * Shared button primitives from the MIT design system, as used across the
 * board, the controls bar and the modals.
 *
 * PrimaryButton — "Button L" filled with MIT red.
 * OutlineButton — "Button M" on white with a light silver-gray border.
 */

export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 18px 24px;
  border: 0;
  border-radius: var(--am-radius);
  background: var(--am-mit-red);
  box-shadow: var(--am-btn-shadow);
  color: var(--am-white);
  font-family: var(--am-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 150ms, transform 100ms;

  &:hover {
    background: var(--am-red);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid var(--am-text-primary);
    outline-offset: 2px;
  }
`

export const OutlineButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 12px 16px;
  border: 1px solid var(--am-light-silver-gray);
  border-radius: var(--am-radius);
  background: var(--am-white);
  color: var(--am-text-secondary);
  font-family: var(--am-font);
  font-size: 14px;
  font-weight: 500;
  line-height: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 150ms, color 150ms;

  &:hover {
    border-color: var(--am-text-secondary);
    color: var(--am-text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--am-text-primary);
    outline-offset: 2px;
  }

  /* Icon-leading variant: the glyph gets 12px of leading space, the label 24px
     of trailing space, per the "Button M with icon" spec. */
  &[data-icon="leading"] {
    padding-left: 12px;
    padding-right: 24px;
  }
`

/** Outline button at "Button L" scale, for modal CTA rows. */
export const OutlineButtonL = styled(OutlineButton)`
  height: 48px;
  padding: 18px 24px;
  font-size: 16px;
  line-height: 16px;
`

/**
 * A number tile's size, shared by the bank and by a tile placed in a slot so
 * that placing one never resizes it. Slots are wider than a tile and hold it
 * centred, which keeps the row's width fixed as tiles go in and out.
 */
export const numberTileSize = css`
  /* Explicit, because these rules are shared between a button and a div and the
     browser only defaults buttons to border-box — the same min-width and padding
     would otherwise measure differently in a slot than in the bank. */
  box-sizing: border-box;
  height: var(--am-tile);
  min-width: var(--am-tile);
  padding: 0 var(--am-tile-px);
  font-size: var(--am-tile-font);
`
