/**
 * Downloads the licensed demo/reference photographs used in Phase 1.
 * Cross-platform (plain Node 22+, no shell). Verifies every file is a real
 * JPEG larger than 20 KB by checking magic bytes, and reports failures
 * instead of writing an empty placeholder.
 *
 * Usage: node scripts/fetch-reference-photos.mjs
 */
import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "images", "reference");
const MIN_BYTES = 20 * 1024;

const photos = [
  {
    file: "hero-greece-delphi-road.jpg",
    author: "Rohan Gangopadhyay",
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    sourcePage:
      "https://unsplash.com/photos/a-road-with-a-mountain-in-the-background-hlNAXkdNH3E",
    url: "https://images.unsplash.com/photo-1704922230180-71d7eff708d1?auto=format&fit=crop&w=2000&q=82"
  },
  {
    file: "vehicle-interior-placeholder.jpg",
    author: "J Z",
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    sourcePage:
      "https://unsplash.com/photos/the-interior-of-a-car-with-a-steering-wheel-and-dashboard-vUvgfalQPK8",
    url: "https://images.unsplash.com/photo-1636763086312-3e0c99e8761e?auto=format&fit=crop&w=1200&q=82"
  },
  {
    file: "demo-peugeot-2008.jpg",
    author: "Unsplash contributor (see source page)",
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    sourcePage: "https://unsplash.com/",
    url: "https://images.unsplash.com/photo-1587112308201-710a5bff8f5c?fm=jpg&q=80&w=1600&auto=format&fit=crop"
  },
  {
    file: "demo-dacia-sandero-stepway.jpg",
    author: "Pexels contributor (see source page)",
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    sourcePage: "https://www.pexels.com/photo/14607289/",
    url: "https://images.pexels.com/photos/14607289/pexels-photo-14607289.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    file: "demo-dacia-jogger.jpg",
    author: "Unsplash contributor (see source page)",
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    sourcePage: "https://unsplash.com/",
    url: "https://images.unsplash.com/photo-1706589271894-4f4887011e51?fm=jpg&q=80&w=1600&auto=format&fit=crop"
  },
  {
    file: "demo-opel-vivaro.jpg",
    author: "Unsplash contributor (see source page)",
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    sourcePage: "https://unsplash.com/",
    url: "https://images.unsplash.com/photo-1768393775846-6d0bd756a847?fm=jpg&q=80&w=1600&auto=format&fit=crop"
  },
  {
    file: "demo-kia-xceed.jpg",
    author: "Pexels contributor (see source page)",
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    sourcePage: "https://www.pexels.com/photo/29057708/",
    url: "https://images.pexels.com/photos/29057708/pexels-photo-29057708.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    file: "demo-kia-rio.jpg",
    author: "Pexels contributor (see source page)",
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    sourcePage: "https://www.pexels.com/photo/11251685/",
    url: "https://images.pexels.com/photos/11251685/pexels-photo-11251685.jpeg?auto=compress&cs=tinysrgb&w=1600"
  }
];

function isJpeg(buffer) {
  return (
    buffer.length > 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

async function main() {
  await mkdir(OUT_DIR, {recursive: true});

  const failures = [];

  for (const photo of photos) {
    const target = path.join(OUT_DIR, photo.file);

    try {
      const response = await fetch(photo.url, {
        headers: {
          "user-agent": "kalimeris-reference-fetch/1.0 (+local build script)"
        },
        redirect: "follow"
      });

      if (!response.ok) {
        failures.push(`${photo.file}: HTTP ${response.status}`);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (buffer.length < MIN_BYTES) {
        failures.push(
          `${photo.file}: only ${buffer.length} bytes (needs > ${MIN_BYTES})`
        );
        continue;
      }

      if (!isJpeg(buffer)) {
        failures.push(
          `${photo.file}: not a JPEG (magic ${buffer
            .subarray(0, 3)
            .toString("hex")})`
        );
        continue;
      }

      await writeFile(target, buffer);
      console.log(`ok   ${photo.file} (${Math.round(buffer.length / 1024)} KB)`);
    } catch (error) {
      failures.push(`${photo.file}: ${error.message}`);
    }
  }

  if (failures.length > 0) {
    console.error("\nFAILED:");
    for (const failure of failures) {
      console.error(` - ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`\nAll ${photos.length} photographs verified.`);
}

await main();
