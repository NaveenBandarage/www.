# Photographs

Keep the photos you want to publish in this repo. From the project root, run:

```sh
bun run photos:add -- /path/to/photo.jpg --title "Evening on Broadway" --alt "People crossing Broadway at dusk"
```

The command creates a web-sized WebP in `public/gallery` and adds its dimensions and details to `data/gallery-photos.json`. New photos appear first on both `/photos` and `/gallery`. Commit both files and push to publish. Keep your original photos somewhere separate as a backup; this command leaves them untouched.

Optional flags:

```sh
--location "New York" --date 2026-10-01 --slug evening-on-broadway --stack "New York walk"
```

Give related photos the same `--stack` name to show them as one layered set. Use a different `--slug` if a title is already in use. Edit the JSON file to change captions, reorder entries, or add optional fields such as `camera`, `exposure`, and `palette`; remove an entry and its image to remove a photo. Existing manually entered photos in `data/gallery.ts` continue to work.

The generated image is resized to at most 2400 pixels on its longest side and its embedded metadata is removed. The title, alt text, location, and date you enter are public. The repo is a convenient home for a curated collection, but a large photo archive will make Git history and deployments grow; keep full-resolution originals in a separate backup.
