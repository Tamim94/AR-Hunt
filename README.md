# AR Hunt

AR Hunt is a mobile-first AR scavenger hunt prototype for a university campus phygital experience. Players scan a Hiro marker, complete campus missions, earn points, and track progress through a game-style overlay on top of the live camera feed.

The prototype is built with Vite, vanilla JavaScript, HTML, CSS, A-Frame, and AR.js. It is designed to run locally for development and deploy cleanly to Netlify for phone testing over HTTPS.

## Features

- Marker-based AR scanning with the default Hiro marker.
- A-Frame 3D scene with a rotating campus model.
- Fallback cyan 3D box if the GLB model cannot load.
- Five hardcoded campus missions worth 10 points each.
- Score counter, current mission panel, progress bar, toast messages, and leaderboard modal.
- Mission completion after holding the Hiro marker in view for 2 seconds.
- Score and completed missions saved in `localStorage`.
- Reset button with confirmation.
- Mobile camera layout fix for AR.js video sizing.
- Netlify-ready deployment with `netlify.toml`.

## Tech Stack

- Vite 8
- Vanilla JavaScript
- HTML and CSS
- A-Frame 1.5.0
- AR.js 3.4.5 via jsDelivr CDN
- Netlify for HTTPS deployment

## Project Structure

```text
AR-Hunt/
  index.html        AR scene, Hiro marker, HUD markup
  game.js           Mission logic, scoring, localStorage, leaderboard
  style.css         Mobile-first dark glass UI
  package.json      Vite scripts and dependencies
  vite.config.js    Local dev server configuration
  netlify.toml      Netlify build and publish settings
  README.md         Project documentation
```

Generated folders such as `node_modules/` and `dist/` are ignored by Git.

## Install and Run Locally

```bash
npm install
npm run dev
```

On Windows PowerShell, if script execution blocks `npm`, use:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL Vite prints, usually:

```text
http://localhost:5173
```

Camera access works on `localhost`. Allow camera permission when the browser asks.

## Build

```bash
npm run build
```

The production build is generated in:

```text
dist/
```

## Deploy with Netlify

This project includes `netlify.toml`, so Netlify can detect the correct build settings automatically.

Use these settings if Netlify asks:

```text
Repository: Tamim94/AR-Hunt
Branch: master
Base directory: leave empty
Build command: npm run build
Publish directory: dist
```

After pushing to GitHub, Netlify should build and deploy the app automatically. The deployed Netlify URL will use HTTPS, which is important for camera access on phones.

## Test on a Phone

Best option:

1. Deploy the repo to Netlify.
2. Open the Netlify HTTPS URL on your phone.
3. Allow camera access.
4. Point the camera at the Hiro marker.
5. Hold the marker steady for 2 seconds to complete a mission.

Alternative local option with ngrok:

```bash
npm run dev
ngrok http 5173
```

Open the HTTPS ngrok URL on your phone.

## Hiro Marker

Print or display the default Hiro marker:

https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png

For the best scan:

- Keep the marker flat.
- Use good lighting.
- Keep the full marker inside the camera frame.
- Avoid glare or heavy shadows.

## How the App Works

`index.html` loads A-Frame and AR.js, defines the Hiro marker, places the 3D campus model on the marker, and renders the HTML HUD overlay.

`game.js` stores the missions array, listens for `markerFound` and `markerLost`, starts a 2-second scan timer, awards points, persists progress, updates the HUD, and renders the leaderboard.

`style.css` creates the dark mobile UI with glass panels, neon cyan/purple accents, large readable text, modal styling, toast animation, and responsive layout.

## Extend with More Missions

Add or edit missions in `game.js`:

```js
{
  id: "library-mascot",
  name: "Library Mascot",
  building: "Main Library",
  points: 10,
  markerType: "hiro"
}
```

For a real campus hunt, each stop could use its own marker. Generate custom marker pattern files with the AR.js marker training tool:

https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html

Then add a custom marker in `index.html`:

```html
<a-marker type="pattern" url="/markers/library.patt"></a-marker>
```

For production, host marker files and 3D models inside this repo instead of depending on external CDNs during the event.

## Troubleshooting

If the camera does not open on phone, make sure you are using an HTTPS URL such as Netlify or ngrok. Plain `http://` URLs usually cannot access the camera on mobile.

If Netlify fails while reading `netlify.toml`, make sure the file is saved as UTF-8 without BOM.

If the 3D model does not appear, the fallback box should appear instead. Also check that the Hiro marker is fully visible and well-lit.

If progress looks wrong during a demo, click `Reset` to clear the saved `localStorage` game state.
