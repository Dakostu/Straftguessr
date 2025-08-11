# STRAFTGUESSR

This is the source code for STRAFTGUESSR, a GeoGuessr/Wordle-like game where you have to guess the map of the FPS [STRAFTAT](https://store.steampowered.com/app/2386720/STRAFTAT/) based on a screenshot.

**Play it here: https://straftguessr.vercel.app/**

## Features

- 1,100+ screenshots from STRAFTAT maps
- Guess which map the screenshot depicts
- Three difficulty levels:
  - **Easy**: obvious locations reachable by foot without tricks
  - **Medium**: harder to reach/discern locations that require intermediate map familiarity
  - **Hard**: obscure, hard-to-reach areas for expert players/Movement Monsters

## How to Play

1. Visit the [live game](https://straftguessr.vercel.app/).
2. View a screenshot and submit your guess for the map name.
3. You get instant feedback whether you're correct, incorrect, or almost correct (same map group, but different suffix).

## I Want to Submit Screenshots!

Great! Here's the easiest way to get your screenshots in the game:

- (Optional but recommended) Install the no-HUD mod from the `HideUI.dll` file in the root folder of this repository. This allows you to disable the HUD and `Exploration Mode` text so you can have full view of whatever you're looking at. Perfect for taking screenshots.
- Screenshots in 16:9 are recommended as to keep a constant aspect ratio throughout the game.
- Submit a GitHub pull request with the new screenshots in the subfolder `static/round_screens`, the corresponding JSON description in `src/routes/game/round_infos/{DIFFICULTY}`. I will then take a look at it and if anything goes right, approve and merge it, making it public instantly.
- A map can have multiple screenshots! Go bananas; I especially want to see medium and hard screenshots!

## JSON Schema for STRAFTGUESSR Screenshots

```json
{
	"correct": ["Map_Name", "Map_Name_2"],
	"desc": "A short description of whatever this screenshot is showing."
}
```

- `correct` is an array of correct answers for this screenshot, meaning that a screenshot allows for multiple correct answers.
- `desc` should be a helpful descrption of the scene depicted in the screenshot.

## Back-end

This repo contains the front-end code and static files (screenshots and JSON files) for the back-end.

- For each screenshot, there must be a corresponding JSON file (schema below) that delivers the correct answer(s) and description.
- Both filenames of the JSON and the image files must be identical, so the game can deduce which image belongs to which JSON data.
- The JSON files are stored according to the difficulty of the round that the file describes. The JSON file needs to be stored in `src/routes/game/round_infos/{DIFFICULTY}` for that.
- (I used to host the screenshots on GitHub's LFS servers but hit a bandwidth limit for free users.)

## License

MIT License. See LICENSE for details.

## Quick Start For Devs

Requirements:

* Node.js
* `pnpm` or `npm`

Get the game running locally in just a few steps:

```bash
# 1. Clone the repository
git clone https://github.com/Dakostu/Straftguessr.git
cd Straftguessr

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm run dev

# 4. Open in your browser
# The console will show a local URL, usually:
# http://localhost:5173

# 5. (Optional) Check the package.json file for more scripts/commands
```

## Thank You

- **Sneaky_Kestrel** for providing the `HideUI.dll`
- **Coal** for providing map thumbnails
- **Gabe Classon** (https://gabeclasson.com) for the `Gontserrat` font
