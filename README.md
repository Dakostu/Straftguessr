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

## I Want to Submit Screenshots/Code/Bug Reports!

Great! Refer to the [CONTRIBUTING](https://github.com/Dakostu/Straftguessr/blob/main/CONTRIBUTING.md) file for details.

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

## Thank You

- **Sneaky_Kestrel** for providing the `HideUI.dll`
- **Coal** for providing map thumbnails
- **Gabe Classon** (https://gabeclasson.com) for the `Gontserrat` font
