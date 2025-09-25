# I Want to Submit Screenshots!

Here's the easiest way to get your screenshots in the game:

- (Optional but recommended) Install the no-HUD mod from the `HideUI.dll` file in the root folder of this repository. This allows you to disable the HUD and `Exploration Mode` text so you can have full view of whatever you're looking at. Perfect for taking screenshots.
- Screenshots in 16:9 are recommended as to keep a constant aspect ratio throughout the game.
- Submit a GitHub pull request with the new screenshots in the subfolder `static/round_screens`, the corresponding JSON description in `src/routes/game/round_infos/{DIFFICULTY}`. I will then take a look at it and if anything goes right, approve and merge it, making it public instantly.
- A map can have multiple screenshots! Go bananas; I especially want to see medium and hard screenshots!

# I Found a Bug/Wrong Answer!

Create a [GitHub issue](https://github.com/Dakostu/Straftguessr/issues/new) in the repository and I'll check it out.

# I Want to Code Something!

OK, here's a quick-start guide.

Requirements:

- Node.js
- `pnpm` or `npm`

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
