This is the source code for STRAFTGUESSR, a GeoGuessr/Wordle-like game where you have to guess the map of the FPS [STRAFTAT](https://store.steampowered.com/app/2386720/STRAFTAT/) based on a screenshot.

**Play it here: https://straftguessr.vercel.app/**

# Back-end

This repo contains the front-end code and static files (screenshots and JSON files) for the back-end.

- For each screenshot, there must be a corresponding JSON file (schema below) that delivers the correct answer(s) and description.
- Both filenames of the JSON and the image files must be identical, so the game can deduce which image belongs to which JSON data.
- The JSON files are stored according to the difficulty of the round that the file describes. The JSON file needs to be stored in `src/routes/game/round_infos/{DIFFICULTY}` for that. See below for each difficulty's meaning.

# I Want to Submit Screenshots!

Great! Here's the easiest way to get your screenshots in the game:

- (Optional but recommended) Install the no-HUD mod from the `HideUI.dll` file in the root folder of this repository. This allows you to disable the HUD and `Exploration Mode` text so you can have full view of whatever you're looking at. Perfect for taking screenshots.
- Screenshots in 16:9 are recommended as to keep a constant aspect ratio throughout the game.
- Submit a GitHub pull request with the new screenshots in the subfolder `static/round_screens`, the corresponding JSON description in `static/round_infos`, and the difficulty assignment in `src/lib/round_list.ts`. I will then take a look at it and if anything goes right, approve and merge it, making it public instantly.
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

## Difficulties & Their Meaning

- **Easy** screenshots show parts of the map that are easily reachable by foot, without having to use special movement tricks or similar.
- **Medium** screenshots show parts of the map that are harder to reach, or hard to discern by first glance. They require some advanced knowledge of the depicted map.
- **Hard** screenshots show parts of the map that are completely obscure, hard to reach, and only known to the real STRAFTAT cracks and Movement Monsters.

Keep in mind that not every `Easy` screenshot has to be very easy, vice versa for `Medium`, but this should be a good first guide!

# TODO

- Some code cleanup and refactoring
- Error handling
- Add more screenshots!

# Thank You

- Sneaky_Kestrel for providing the `HideUI.dll`
- Coal for providing map thumbnails
- Gabe Classon (https://gabeclasson.com) for the `Gontserrat` font
