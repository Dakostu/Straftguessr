This is the source code for STRAFTGUESSR, a GeoGuessr-like game where you have to guess the map of the FPS [STRAFTAT](https://store.steampowered.com/app/2386720/STRAFTAT/) based on a screenshot.

**Play it here: https://straftguessr.vercel.app/**

# Backend

This repo contains mostly the front-end code, as the back-end is currently based on Vercel Blob storage. It is possible for you to fork this project and hook it up to a separate storage with your own screenshots.

# I Want to Submit Screenshots!

Great, here's the easiest way to get your screenshots in the game:

* (Optional but recommended) Install the no-HUD mod from the `HideUI.dll` file in the root folder of this repository. This allows you to disable the HUD and `Exploration Mode` text so you can have full view of whatever you're looking at. Perfect for taking screenshots.
* Screenshots in 16:9 are recommended as to keep a constant aspect ratio throughout the game.
* Submit a GitHub issue with the screenshots and a JSON description (schema below) of each screenshot. I will then take a look at it and if anything goes right, add it to the main Vercel Blob, making it public instantly.
* Both filenames of the JSON and the image files should be identical, so the game can deduce which image belongs to which JSON data.
* A map can have multiple screenshots! Go nuts, I especially want to see medium and hard screenshots!

## JSON Schema for STRAFTGUESSR Screenshots

```json
{
    "correct": ["Map_Name", "Map_Name_2"],
    "diff": "Easy"/"Medium"/"Hard",
    "desc": "A short description of whatever this screenshot is showing."
}
```

* `correct` is an array of correct answers for this screenshot, meaning that a screenshot allows for multiple correct answers.
* `diff` is the difficulty. See below for their meaning.
* `desc` should be a helpful descrption of the scene depicted in the screenshot.

## Difficulties & Their Meaning

* **Easy** screenshots show parts of the map that are easily reachable by foot, without having to use special movement tricks or similar.
* **Medium** screenshots show parts of the map that are harder to reach, or hard to discern by first glance. They require some advanced knowledge of the depicted map.
* **Hard** screenshots show parts of the map that are completely obscure, hard to reach, and only known to the real STRAFTAT cracks and Movement Monsters.

Keep in mind that not every `Easy` screenshot has to be very easy, vice versa for `Medium`, but this should be a good first guide!


# TODO

* Some code cleanup and refactoring
* Polishing the UI. Namely making it more responsive for smartphones and maybe changing the textbox components.
* Error handling
* Add more screenshots!

# Thank You

* Sneaky_Kestrel for providing the `HideUI.dll`
* Coal for providing map thumbnails
