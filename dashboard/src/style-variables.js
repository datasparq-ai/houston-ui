const delta = 20;

const styleVariables = {
  delta: delta,  // px - the standard small distance throughout the app
  planHeight: 64,  // px
  planWidth: 700 - 2 * delta, // px
  viewWidthPercent: 1.0, // % of window.innerWidth
  viewHeightPercent: 1.0, // % of window.innerHeight

  background: "var(--background)",
  appHeight: "var(--app-height)",
  linkWidth: "var(--link-width)",
  textColour: "var(--text-colour)",
  tooltipTextColour: "var(--tooltip-text-colour)",
  font: "var(--font)",
  monoFont: "var(--mono-font)",
  icon: "var(--icon)",
  link: "var(--link)",
  linkHighlight: "var(--linkHighlight)",
}

styleVariables.graphWidthPercent = 0.6 * styleVariables.viewWidthPercent  // % of window.innerWidth

export default styleVariables
