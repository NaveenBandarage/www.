import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const source = args.shift();
const options = {};
while (args.length) {
  const flag = args.shift();
  if (!flag?.startsWith("--") || !args.length || args[0].startsWith("--")) {
    console.error("Expected options in the form --title 'Photo title'.");
    process.exit(1);
  }
  options[flag.slice(2)] = args.shift();
}
if (!source || !options.title || !options.alt) {
  console.error(
    'Usage: bun run photos:add -- /path/to/photo.jpg --title "Title" --alt "Describe the photo" [--location "New York"] [--date YYYY-MM-DD] [--stack "Trip name"]',
  );
  process.exit(1);
}
const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const slug = slugify(options.slug || options.title);
if (!slug)
  throw new Error("The title or slug must contain letters or numbers.");
const stackSlug = options.stack ? slugify(options.stack) : undefined;
if (options.stack && !stackSlug)
  throw new Error("The stack name must contain letters or numbers.");
const manifestPath = path.join(process.cwd(), "data/gallery-photos.json");
const destination = path.join(process.cwd(), "public/gallery", `${slug}.webp`);
const photos = JSON.parse(await readFile(manifestPath, "utf8"));
if (
  photos.some(
    (photo) => photo.slug === slug || photo.src === `/gallery/${slug}.webp`,
  )
)
  throw new Error(
    `A photo named ${slug} already exists. Use --slug to choose another.`,
  );
try {
  await access(destination);
  throw new Error(`File already exists: ${destination}`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
await mkdir(path.dirname(destination), { recursive: true });
const image = sharp(source)
  .rotate()
  .resize({
    width: 2400,
    height: 2400,
    fit: "inside",
    withoutEnlargement: true,
  })
  .webp({ quality: 82 });
const { width, height } = await image.toFile(destination);
const photo = {
  src: `/gallery/${slug}.webp`,
  alt: options.alt,
  width,
  height,
  title: options.title,
  slug,
};
if (options.location) photo.location = options.location;
if (options.date) photo.date = options.date;
if (options.stack) photo.stack = { slug: stackSlug, title: options.stack };
photos.unshift(photo);
try {
  await writeFile(manifestPath, `${JSON.stringify(photos, null, 2)}\n`);
} catch (error) {
  console.error(
    `Image saved at ${destination}, but the manifest could not be updated.`,
  );
  throw error;
}
console.log(
  `Added ${photo.src}. Commit it together with data/gallery-photos.json to publish.`,
);
