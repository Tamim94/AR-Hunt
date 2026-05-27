# AR Hunt

AR Hunt is a local Vite prototype for a university campus phygital scavenger hunt. It uses A-Frame plus AR.js marker tracking, overlays game UI on top of the camera feed, and stores player progress in `localStorage`.

## Install and Run

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

## Test on a Phone

Phones usually need HTTPS for camera access unless they are on `localhost`, so tunnel your Vite server with ngrok:

```bash
npm run dev
ngrok http 5173
```

Open the HTTPS ngrok URL on your phone, allow camera access, and point the camera at the Hiro marker.

## Print the Hiro Marker

Print or display the default Hiro marker:

https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png

Keep the marker flat, well-lit, and fully visible in the camera frame.

## How the Prototype Works

- `index.html` loads A-Frame 1.5.0 and AR.js 3.4.8 from CDNs.
- The `<a-marker preset="hiro">` element listens for the default Hiro marker.
- When the marker is visible, the 3D campus model rotates and floats.
- If the GLB model does not load, a glowing cyan box appears as the fallback AR object.
- `game.js` waits for the marker to stay visible for 2 seconds, completes the current mission, adds points, saves progress, and advances to the next mission.
- `style.css` keeps the game HUD readable for phone filming with a dark glass UI and cyan/purple neon accents.

## Extend with More Markers

1. Add new mission objects to the `missions` array in `game.js`.
2. Generate custom AR.js marker pattern files with the AR.js marker training tool:
   https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
3. Add more marker elements in `index.html`, for example:

```html
<a-marker type="pattern" url="/markers/library.patt" emitevents="true"></a-marker>
```

4. Update each mission's `markerType` or add a `markerUrl` field so the game can match the scanned marker to the correct campus mission.

For a production campus hunt, host marker files and 3D models in the project itself to avoid CDN or CORS issues during an event.
