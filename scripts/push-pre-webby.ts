/**
 * push-pre-webby
 * args: [--dry-run] [--update] [--only <slug>]
 * returns: creates HTML templates in GHL folder "Webby | Email Templates"
 *          with subjectLine + previewText from misc/meta/*.meta.json
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webbyRoot = resolve(repoRoot, "emails/webby");
const envPath = resolve(webbyRoot, "misc/.env");
const configPath = resolve(webbyRoot, "misc/config.json");

const envText = await Bun.file(envPath).text();
const pit = envText.match(/^GHL_PIT=(.+)$/m)?.[1]?.trim();
const locationId = envText.match(/^GHL_LOCATION_ID=(.+)$/m)?.[1]?.trim();
if (!pit || !locationId) {
  throw new Error("Missing GHL_PIT or GHL_LOCATION_ID in emails/webby/misc/.env");
}

const config = (await Bun.file(configPath).json()) as {
  folderName: string;
  slugs: string[];
};

const VERSION = "2021-07-28";
const dryRun = Bun.argv.includes("--dry-run");
const updateExisting = Bun.argv.includes("--update");
const onlyIdx = Bun.argv.indexOf("--only");
const onlySlug = onlyIdx >= 0 ? Bun.argv[onlyIdx + 1] : null;

type Meta = {
  proposedName: string;
  subject: string;
  previewText?: string;
};

type PushResult = {
  slug: string;
  templateId?: string;
  folderId?: string;
};

type BuilderItem = {
  id: string;
  name: string;
  templateType?: string;
};

async function loadExistingResults(): Promise<Map<string, PushResult>> {
  const path = resolve(webbyRoot, "misc/push-results-pre-webby.json");
  const file = Bun.file(path);
  if (!(await file.exists())) return new Map();
  const rows = (await file.json()) as PushResult[];
  return new Map(rows.filter((row) => row.templateId).map((row) => [row.slug, row]));
}

async function ghl(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://services.leadconnectorhq.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${pit}`,
      Version: VERSION,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function listBuilderItems(parentId?: string) {
  const query = parentId
    ? `?locationId=${locationId}&parentId=${parentId}`
    : `?locationId=${locationId}`;
  return ghl(`/emails/builder${query}`);
}

async function findFolderByName(name: string): Promise<string | null> {
  const root = await listBuilderItems();
  const rootBuilders = ((root.json as { builders?: BuilderItem[] }).builders) || [];

  const direct = rootBuilders.find((b) => b.templateType === "folder" && b.name === name);
  if (direct) return direct.id;

  for (const item of rootBuilders) {
    if (item.templateType !== "folder") continue;
    const nested = await listBuilderItems(item.id);
    const nestedBuilders = ((nested.json as { builders?: BuilderItem[] }).builders) || [];
    const match = nestedBuilders.find((b) => b.templateType === "folder" && b.name === name);
    if (match) return match.id;
  }

  return null;
}

async function ensureFolder(name: string): Promise<string> {
  const existing = await findFolderByName(name);
  if (existing) return existing;

  console.log("creating folder:", name);
  const created = await ghl("/emails/builder", {
    method: "POST",
    body: JSON.stringify({
      locationId,
      type: "folder",
      name,
      title: name,
      builderVersion: "2",
      updatedBy: "the-visible-method",
    }),
  });
  const id = (created.json as { id?: string }).id;
  if (!created.ok || !id) {
    throw new Error(`Failed to create folder: ${name} (${created.status})`);
  }
  return id;
}

async function createHtmlTemplate(name: string, parentId: string) {
  return ghl("/emails/builder", {
    method: "POST",
    body: JSON.stringify({
      locationId,
      type: "html",
      name,
      title: name,
      parentId,
      builderVersion: "2",
      isPlainText: false,
      updatedBy: "the-visible-method",
    }),
  });
}

async function patchTemplate(
  templateId: string,
  html: string,
  subject: string,
  previewText?: string,
) {
  const content = await ghl(`/emails/builder/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify({
      locationId,
      editorType: "html",
      editorContent: html,
      updatedBy: "the-visible-method",
    }),
  });

  const settingsBody: Record<string, string> = {
    locationId,
    subjectLine: subject,
  };
  if (previewText) settingsBody.previewText = previewText;

  const settings = await ghl(`/emails/builder/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(settingsBody),
  });
  return { content, settings, ok: content.ok && settings.ok, json: settings.json };
}

const folderName = config.folderName;
const slugs = onlySlug ? config.slugs.filter((slug) => slug === onlySlug) : config.slugs;

if (onlySlug && slugs.length === 0) {
  throw new Error(`Unknown slug: ${onlySlug}`);
}

const existingBySlug = updateExisting ? await loadExistingResults() : new Map<string, PushResult>();
const folderId = dryRun ? "dry-run" : await ensureFolder(folderName);

console.log(`\n=== PRE-WEBBY → ${folderName}${dryRun ? " (dry-run)" : ` (${folderId})`}${updateExisting ? " [update]" : ""} ===`);

const results: Array<Record<string, unknown>> = [];

for (const slug of slugs) {
  const html = await Bun.file(resolve(webbyRoot, `${slug}.html`)).text();
  const meta = (await Bun.file(resolve(webbyRoot, `misc/meta/${slug}.meta.json`)).json()) as Meta;
  const name = meta.proposedName;

  console.log(`\n== ${slug}`);
  console.log(`name: ${name}`);
  console.log(`subject: ${meta.subject}`);
  console.log(`preview: ${meta.previewText ?? "(none)"}`);

  if (dryRun) {
    results.push({ slug, name, subject: meta.subject, previewText: meta.previewText, dryRun: true });
    continue;
  }

  const existing = existingBySlug.get(slug);
  let templateId = existing?.templateId;

  if (!updateExisting) {
    const created = await createHtmlTemplate(name, folderId);
    templateId = (created.json as { id?: string }).id;
    console.log("create status:", created.status, "id:", templateId);

    if (!created.ok || !templateId) {
      results.push({ slug, name, error: "create_failed", create: created });
      console.error("FAILED create — stopping");
      break;
    }
  } else {
    if (!templateId) {
      throw new Error(`Missing templateId for ${slug} in push-results-pre-webby.json`);
    }
    console.log("update existing template:", templateId);
  }

  const patched = await patchTemplate(templateId, html, meta.subject, meta.previewText);
  const settingsJson = patched.json as Record<string, unknown>;
  console.log("content:", patched.content.status, "settings:", patched.settings.status);
  console.log("saved subjectLine:", settingsJson.subjectLine);
  console.log("saved previewText:", settingsJson.previewText);

  results.push({
    slug,
    name,
    templateId,
    folderId,
    folderName,
    subject: meta.subject,
    previewText: meta.previewText,
    savedSubjectLine: settingsJson.subjectLine,
    savedPreviewText: settingsJson.previewText,
    createStatus: updateExisting ? "update" : "create",
    patchOk: patched.ok,
  });

  if (!patched.ok) {
    console.error("FAILED patch — stopping");
    break;
  }
}

const outPath = resolve(webbyRoot, "misc/push-results-pre-webby.json");
await Bun.write(outPath, `${JSON.stringify(results, null, 2)}\n`);
console.log(`\nWrote ${outPath}`);

if (!dryRun && folderId !== "dry-run") {
  const list = await listBuilderItems(folderId);
  const builders = ((list.json as { builders?: BuilderItem[] }).builders) || [];
  console.log(`\n--- ${folderName} ---`);
  for (const b of builders) console.log(b.id, b.name);
}
