# spiral-time

A prototype for a day timeline drawn as a ribbon on a 3D surface: a spiral on a cone,
a receding coil, an unrolled strip and a week of columns, with animated transitions
between them. Content is drawn per day into a texture and mapped onto the ribbon.

Single file, no build. Open `index.html` over any static server, or use the GitHub Pages
deployment. Three.js loads from a CDN.

Controls: drag to tilt and spin, wheel to zoom, panel top right for views, shape,
time and shading. Append `?view=coil` (or `linear`, `week`) to open in a view,
`?debug` for render stats, `?strip` to see the raw day textures.
