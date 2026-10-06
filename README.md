# spiral-time

A prototype for a day timeline drawn as a ribbon on a 3D surface: a spiral on a cone,
a receding coil, an unrolled strip and a week of columns, with animated transitions
between them. Content is drawn per day into a texture and mapped onto the ribbon.

The calendar is mock data, generated per date from a seed: the same date always shows the
same day, and neighbouring days differ.

Single file, no build. Open `index.html` over any static server, or use the GitHub Pages
deployment. Three.js loads from a CDN.

## Your own calendars

Put each calendar's secret iCal address (Google Calendar: Settings → the calendar →
"Secret address in iCal format") in `.env`, one line each:

```bash
ICAL_PERSONAL=https://calendar.google.com/calendar/ical/.../basic.ics
ICAL_WORK=https://calendar.google.com/calendar/ical/.../basic.ics
ICAL_WORK_COLOR=#3d6e9c        # optional
ICAL_TIMEBLOCK_KIND=context    # optional: draw as background washes instead of events
SUN_LAT=34.05                  # optional: where sunrise and sunset are for
SUN_LON=-118.24                #   (San Francisco by default; ?lat=&lon= also works)
```

`npm start` downloads them into `cal/` and serves the page on http://localhost:8000/ (Node 20+,
no dependencies). The legend lists the calendars, and its Refresh button downloads them again.
`npm run fetch` downloads without serving. With no `cal/` (GitHub Pages) or with `?mock`, the
page shows the sample calendar. `.env` and `cal/` are git-ignored: the addresses work like
passwords. Real calendars bring events, all-day events and zero-length reminders; sleep, walks and
the energy curve exist only in the sample.

Controls: drag to tilt and spin, wheel or pinch to zoom, buttons at the bottom to switch
views, zoom and reset controls at bottom right, and Display settings at top right for
shape, time and shading. Go live returns from a simulated time to the current clock.
On phones, the strip and week views frame a smaller span so events stay readable;
zoom out for more context. View transitions respect reduced-motion preferences. Append `?view=coil` (or
`linear`, `week`) to open in a view, `?hour=18.5` to set the clock, `?seed=anything` to
reshuffle the mock calendar, `?debug` for render stats, `?strip` to see the raw day
textures.
