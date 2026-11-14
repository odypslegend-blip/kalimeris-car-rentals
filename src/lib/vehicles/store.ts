import {AwsClient} from "aws4fetch";
import {vehicles} from "@/lib/data/fleet";
import type {ManagedVehicle, VehicleInput} from "./types";

/**
 * DB-free vehicle store.
 *
 * Server-only: never import this from a client component. It reads and writes
 * one JSON manifest (`vehicles/index.json`) either in Cloudflare R2 (when all
 * five `R2_*` variables are configured) or in a local directory
 * (`VEHICLE_STORE_DIR`, default `.data/vehicles`). A static export always
 * reads the seed data baked into `src/lib/data/fleet.ts`.
 *
 * There is no in-process cache: callers that render server components are
 * expected to declare their own `revalidate`.
 */

export const MANIFEST_KEY = "vehicles/index.json";

const SEED_TIMESTAMP = "2024-01-01T00:00:00.000Z";
const CONTENT_TYPE_JSON = "application/json";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif"
};

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

/**
 * The six static fleet entries, mapped into the storage shape. Used as the
 * fallback whenever no manifest has been written yet (and for the static
 * export, which has no server-side storage at all).
 */
export function seedVehicles(): ManagedVehicle[] {
  return vehicles.map((vehicle, index) => ({
    id: vehicle.slug,
    slug: vehicle.slug,
    name: `${vehicle.make} ${vehicle.model}`,
    brand: vehicle.make,
    model: vehicle.model,
    modelNote: vehicle.modelNote,
    year: vehicle.year,
    pricePerDay: null,
    descriptionEl: vehicle.descriptionEl,
    descriptionEn: vehicle.descriptionEn,
    images: vehicle.gallery.map((image) => ({
      key: image.src,
      url: image.src,
      alt: image.altEl
    })),
    transmission: vehicle.transmission,
    fuel: vehicle.fuel,
    seats: vehicle.seats,
    luggage: vehicle.luggage,
    category: vehicle.category,
    available: true,
    // The first three mirror the homepage's existing featured preview.
    featured: index < 3,
    published: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  }));
}

/** Absolute path of the local manifest directory, resolved from the CWD. */
function storeDir(): string {
  const configured = process.env.VEHICLE_STORE_DIR ?? ".data/vehicles";

  if (
    configured.startsWith("/") ||
    configured.startsWith("\\\\") ||
    /^[A-Za-z]:[\\/]/.test(configured)
  ) {
    return configured;
  }

  return `${process.cwd().replace(/[\\/]+$/, "")}/${configured}`;
}

/** Every `R2_*` variable is required before the R2 backend is used. */
function r2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    !publicBaseUrl
  ) {
    return null;
  }

  return {accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl};
}

function r2Client(config: R2Config): AwsClient {
  return new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: "auto"
  });
}

function r2Url(config: R2Config, key: string): string {
  return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${key}`;
}

function parseManifest(text: string): ManagedVehicle[] | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as ManagedVehicle[]) : null;
  } catch {
    return null;
  }
}

/**
 * Reads the full manifest. A missing, unreadable or malformed manifest falls
 * back to the seed fleet, so a fresh install always renders six vehicles.
 * The returned array is always a fresh object the caller may sort/replace.
 */
export async function readAll(): Promise<ManagedVehicle[]> {
  if (process.env.STATIC_EXPORT === "1") {
    return seedVehicles();
  }

  const config = r2Config();

  if (config) {
    try {
      const client = r2Client(config);
      const response = await client.fetch(r2Url(config, MANIFEST_KEY), {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        return seedVehicles();
      }

      const parsed = parseManifest(await response.text());
      return parsed ?? seedVehicles();
    } catch {
      return seedVehicles();
    }
  }

  try {
    const fs = await import("node:fs/promises");
    const text = await fs.readFile(`${storeDir()}/index.json`, "utf8");
    return parseManifest(text) ?? seedVehicles();
  } catch {
    // ENOENT, permissions, invalid JSON: the seeds are the correct fallback.
    return seedVehicles();
  }
}

/** Writes the whole manifest (R2 put, or a pretty-printed local file). */
export async function writeAll(list: ManagedVehicle[]): Promise<void> {
  const body = JSON.stringify(list, null, 2);
  const config = r2Config();

  if (config) {
    const client = r2Client(config);
    const response = await client.fetch(r2Url(config, MANIFEST_KEY), {
      method: "PUT",
      headers: {
        "content-type": CONTENT_TYPE_JSON,
        "cache-control": "no-store"
      },
      body
    });

    if (!response.ok) {
      throw new Error(
        `Vehicle store write failed (${response.status} ${response.statusText})`
      );
    }

    return;
  }

  const fs = await import("node:fs/promises");
  const dir = storeDir();

  await fs.mkdir(dir, {recursive: true});
  await fs.writeFile(`${dir}/index.json`, body, "utf8");
}

/** Published vehicles for the public site: featured first, then by name. */
export async function getPublishedVehicles(): Promise<ManagedVehicle[]> {
  const list = await readAll();

  return list
    .filter((vehicle) => vehicle.published === true)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

/** Every vehicle, newest first. For the (not yet built) admin surface. */
export async function getAllVehicles(): Promise<ManagedVehicle[]> {
  const list = await readAll();

  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** A published vehicle by slug, or `undefined` (public pages call notFound). */
export async function getVehicleForPublic(
  slug: string
): Promise<ManagedVehicle | undefined> {
  const list = await getPublishedVehicles();
  return list.find((vehicle) => vehicle.slug === slug);
}

/** A vehicle by id regardless of publish state. */
export async function getVehicleById(
  id: string
): Promise<ManagedVehicle | undefined> {
  const list = await readAll();
  return list.find((vehicle) => vehicle.id === id);
}

/** A vehicle by slug regardless of publish state. */
export async function getVehicleBySlugAny(
  slug: string
): Promise<ManagedVehicle | undefined> {
  const list = await readAll();
  return list.find((vehicle) => vehicle.slug === slug);
}

/**
 * Creates or replaces a vehicle. Passing an `id` keeps its `createdAt`;
 * otherwise a UUID is generated. `slug` is expected to be validated by the
 * caller (no admin route exists yet).
 */
export async function saveVehicle(
  input: VehicleInput,
  id?: string
): Promise<ManagedVehicle> {
  const list = await readAll();
  const now = new Date().toISOString();

  if (id) {
    const index = list.findIndex((vehicle) => vehicle.id === id);

    if (index === -1) {
      throw new Error(`Vehicle not found: ${id}`);
    }

    const updated: ManagedVehicle = {
      ...input,
      id,
      createdAt: list[index].createdAt,
      updatedAt: now
    };

    list[index] = updated;
    await writeAll(list);
    return updated;
  }

  const created: ManagedVehicle = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  };

  list.push(created);
  await writeAll(list);
  return created;
}

/** Removes a vehicle; a no-op when the id is unknown. */
export async function deleteVehicle(id: string): Promise<void> {
  const list = await readAll();
  const remaining = list.filter((vehicle) => vehicle.id !== id);

  if (remaining.length === list.length) return;

  await writeAll(remaining);
}

/**
 * Persists one uploaded image and returns its storage key and public URL.
 * R2 puts the object under the bucket; the local backend writes beneath
 * `public/uploads` so `next/image` can serve it without a remote pattern.
 */
export async function saveImage(
  fileBytes: Uint8Array,
  contentType: string,
  vehicleId: string
): Promise<{key: string; url: string}> {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  const extension = IMAGE_EXTENSIONS[normalized];

  if (!extension) {
    throw new Error(`Unsupported image content type: ${contentType}`);
  }

  const key = `vehicles/images/${vehicleId}/${crypto.randomUUID()}.${extension}`;
  const config = r2Config();

  if (config) {
    // aws4fetch hashes the payload, so it needs an ArrayBuffer or a typed
    // array — never a Blob. Copy into an owned ArrayBuffer to guarantee that.
    const body: ArrayBuffer = new Uint8Array(fileBytes).buffer;
    const client = r2Client(config);
    const response = await client.fetch(r2Url(config, key), {
      method: "PUT",
      headers: {
        "content-type": normalized,
        "cache-control": "no-store"
      },
      body
    });

    if (!response.ok) {
      throw new Error(
        `Vehicle image upload failed (${response.status} ${response.statusText})`
      );
    }

    return {
      key,
      url: `${config.publicBaseUrl.replace(/\/+$/, "")}/${key}`
    };
  }

  const fs = await import("node:fs/promises");
  const filePath = `${process.cwd()}/public/uploads/${key}`;
  const directory = filePath.slice(0, filePath.lastIndexOf("/"));

  await fs.mkdir(directory, {recursive: true});
  await fs.writeFile(filePath, fileBytes);

  return {key, url: `/uploads/${key}`};
}
