# Charles Dickens London Walking Tour

An interactive walking tour map featuring 22 historic Dickens-related sites in London, built with HERE Maps API.

## Features

- Interactive map with route visualization
- Turn-by-turn walking directions
- Detailed historical information for each stop
- Print-friendly directions
- Mobile-responsive design

## Local Development

### Prerequisites

- A HERE Maps API key (get one at [developer.here.com](https://developer.here.com))

### Running Locally

For local development, you can open `index.html` directly in your browser. The app will use the placeholder API key value.

To test with a real API key locally:

```bash
# Set your API key as an environment variable
export HERE_MAPS_API_KEY="your-api-key-here"

# Run the build script
./build.sh

# Serve the dist folder with any static server
cd dist
python -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000 in your browser.

## Deploying to Netlify

### 1. Connect Your Repository

1. Push this repository to GitHub/GitLab/Bitbucket
2. Log in to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to your Git provider and select this repository

### 2. Configure Build Settings

Netlify will automatically detect the `netlify.toml` configuration file. Verify these settings:

- **Build command**: `./build.sh`
- **Publish directory**: `dist`

### 3. Add Environment Variable

**Critical Step:** Add your HERE Maps API key as an environment variable:

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable** → **Add a single variable**
3. Set:
   - **Key**: `HERE_MAPS_API_KEY`
   - **Value**: Your actual HERE Maps API key
   - **Scopes**: Check all contexts (Production, Deploy Previews, Branch deploys)
4. Click **Create variable**

### 4. Deploy

Click **Deploy site**. Netlify will:
1. Run `./build.sh`
2. Replace the placeholder with your API key
3. Publish the `dist` folder

## Project Structure

```
.
├── index.html           # Main application page
├── route-info.html      # Detailed route guide
├── route.js             # Map logic and routing (source file with placeholder)
├── build.sh             # Build script for API key injection
├── netlify.toml         # Netlify configuration
├── dist/                # Build output (generated, not committed)
│   ├── index.html
│   ├── route-info.html
│   └── route.js         # With API key injected
└── README.md

```

## How the Build Process Works

1. `build.sh` creates a `dist/` directory
2. HTML files are copied to `dist/` unchanged
3. `route.js` is processed to replace `"HERE_MAPS_API_KEY"` with the actual API key from the environment variable
4. The processed file is saved to `dist/route.js`
5. Netlify serves the `dist/` folder

## Security Note

**Important**: With this approach, the API key is still visible in the client-side JavaScript (users can see it in browser DevTools). This is acceptable for HERE Maps API keys that are:

- Restricted to specific domains (configure in HERE developer console)
- Rate-limited appropriately
- Using the free tier or have usage alerts set up

For complete security (hiding the API key from users), you would need a serverless function proxy - see CLAUDE.md for Option 2 implementation details.

## Updating the Tour

To modify tour stops, edit the `tourStops` array in `route.js` (lines 6-29). Each stop needs:

- `name`: Full descriptive name
- `label`: Short label for the marker
- `lat`: Latitude
- `lng`: Longitude

## License

MIT
