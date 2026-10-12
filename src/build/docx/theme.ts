// The Word document's look: fonts every machine has, sizes in points.

export const FONTS = { body: "Arial", mono: "Courier New" }

export const COLORS = { text: "000000", muted: "666666", rule: "DDDDDD" }

export const SIZES = {
  name: 22,
  label: 13,
  entry: 11,
  body: 10.5,
  small: 9.5,
}

/** Half-points, as Word measures font sizes. */
export const halfPoints = (points: number) => points * 2
