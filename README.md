# spiral-time

A prototype for a day timeline drawn as a ribbon on a 3D surface: a spiral on a cone,
a receding coil, an unrolled strip and a week of columns, with animated transitions
between them. Content is drawn per day into a texture and mapped onto the ribbon.

The calendar is mock data, generated per date from a seed: the same date always shows the
same day, and neighbouring days differ.

Single file, no build. Open `index.html` over any static server, or use the GitHub Pages
deployment. Three.js loads from a CDN.

Controls: drag to tilt and spin, wheel or pinch to zoom, buttons bottom left to switch
views, settings panel top right for shape, time and shading. Append `?view=coil` (or
`linear`, `week`) to open in a view, `?hour=18.5` to set the clock, `?seed=anything` to
reshuffle the mock calendar, `?debug` for render stats, `?strip` to see the raw day
textures.
