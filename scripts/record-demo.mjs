// Records only this local synthetic workspace. No external assets or customer files.
import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { Buffer } from "node:buffer";
import ffmpeg from "ffmpeg-static";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const media = path.join(root, "public/media");
const artifacts = path.join(root, "artifacts");
await mkdir(media, { recursive: true });
await mkdir(path.join(artifacts, "recording"), { recursive: true });
const scenes = JSON.parse(
  await readFile(path.join(root, "scripts/walkthrough.json"), "utf8"),
);
const sampleRate = 22050;
const bytesPerSecond = sampleRate * 2;

function pcmFromWave(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF")
    throw new Error("Not a WAV file");
  let pcm;
  let valid = false;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (id === "fmt ")
      valid =
        buffer.readUInt16LE(start) === 1 &&
        buffer.readUInt16LE(start + 2) === 1 &&
        buffer.readUInt32LE(start + 4) === sampleRate &&
        buffer.readUInt16LE(start + 14) === 16;
    if (id === "data") pcm = buffer.subarray(start, start + size);
    offset = start + size + (size % 2);
  }
  if (!valid || !pcm?.length)
    throw new Error("Expected 22050 Hz mono 16-bit narration");
  return pcm;
}
const narration = await Promise.all(
  scenes.map(async (scene) => ({
    ...scene,
    pcm: pcmFromWave(
      await readFile(path.join(artifacts, "narration", `${scene.id}.wav`)),
    ),
  })),
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: path.join(artifacts, "recording"),
    size: { width: 1440, height: 1000 },
  },
});
const page = await context.newPage();
const recordingStart = Date.now();
const video = page.video();
const timeline = [];
const pause = (milliseconds) => page.waitForTimeout(milliseconds);
const nav = (name) =>
  page.getByRole("navigation").getByRole("link", { name, exact: true }).click();
const prepare = {
  overview: async () => {
    await page.getByRole("button", { name: "Run sample preview" }).click();
    await page
      .getByRole("heading", { name: "Your sample dashboard is ready" })
      .waitFor();
  },
  imports: async () => {
    await page.goto("http://127.0.0.1:5173/app/new-reconciliation");
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole("button", { name: "Use sample bank file" }).click();
    await page.getByRole("button", { name: "Use sample ledger file" }).click();
    await page.screenshot({ path: path.join(media, "workflow-poster.png") });
  },
  mapping: async () => {
    await page.getByRole("button", { name: "Continue to mapping" }).click();
  },
  rules: async () => {
    await page.getByRole("button", { name: "Continue to matching" }).click();
  },
  results: async () => {
    await page
      .getByRole("link", { name: "Open reconciliation", exact: true })
      .click();
  },
  evidence: async () => {
    await page.getByRole("button", { name: /^Needs review/ }).click();
    await page
      .getByRole("button", { name: "View evidence for TX-1009" })
      .click();
  },
  proposal: async () => {
    await page.getByRole("button", { name: "Close details" }).click();
    await page.getByRole("button", { name: /^Matched/ }).click();
    await page
      .getByRole("button", { name: "View evidence for TX-1001" })
      .click();
    await page
      .getByLabel("Review reason")
      .fill("Verified source references, dates and exact amounts.");
    await page.getByLabel("Review reason").scrollIntoViewIfNeeded();
  },
  approval: async () => {
    await page.getByRole("button", { name: "Submit demo proposal" }).click();
    await page.getByRole("link", { name: "Open approvals" }).click();
  },
  finish: async () => {
    await nav("Activity & reports");
  },
};

try {
  for (const scene of narration) {
    await prepare[scene.id]();
    await pause(350);
    const start = (Date.now() - recordingStart) / 1000;
    const duration = scene.pcm.length / bytesPerSecond;
    timeline.push({ ...scene, start, duration });
    console.log(
      `${scene.id}: ${start.toFixed(2)}s / ${duration.toFixed(2)}s narration`,
    );
    if (scene.id === "approval") {
      await pause(5000);
      await page
        .getByLabel("Demo role", { exact: true })
        .selectOption("approver");
      await pause(1800);
      await page.getByRole("button", { name: "Approve in demo" }).click();
    }
    if (scene.id === "overview") {
      await pause(8500);
      await page.getByRole("link", { name: /Open full dashboard/ }).click();
    }
    const elapsed = (Date.now() - recordingStart) / 1000 - start;
    await pause(Math.max(0, duration - elapsed) * 1000 + 650);
  }
} finally {
  await context.close();
  await browser.close();
}
const rawVideo = await video.path();
const last = timeline.at(-1);
const totalDuration = last.start + last.duration + 0.7;
const pcm = Buffer.alloc(Math.ceil(totalDuration * sampleRate) * 2);
for (const scene of timeline)
  scene.pcm.copy(pcm, Math.round(scene.start * sampleRate) * 2);
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(bytesPerSecond, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);
const wavePath = path.join(artifacts, "workflow-narration.wav");
await writeFile(wavePath, Buffer.concat([header, pcm]));
function timestamp(seconds) {
  return new Date(Math.round(seconds * 1000)).toISOString().slice(11, 23);
}
const cues = timeline.flatMap((scene) => {
  const sentences = scene.narration.match(/[^.!?]+[.!?]+/g) ?? [
    scene.narration,
  ];
  return sentences.map(
    (sentence, index) =>
      `${timestamp(scene.start + (scene.duration * index) / sentences.length)} --> ${timestamp(scene.start + (scene.duration * (index + 1)) / sentences.length)}\n${sentence.trim()}`,
  );
});
await writeFile(
  path.join(media, "workflow-captions.vtt"),
  `WEBVTT\n\n${cues.join("\n\n")}\n`,
);
await writeFile(
  path.join(artifacts, "walkthrough-timeline.json"),
  JSON.stringify(
    timeline.map(({ id, start, duration, narration: text }) => ({
      id,
      start,
      duration,
      text,
    })),
    null,
    2,
  ),
);
const encoded = spawnSync(
  ffmpeg,
  [
    "-y",
    "-i",
    rawVideo,
    "-i",
    wavePath,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "libvpx",
    "-deadline",
    "realtime",
    "-cpu-used",
    "4",
    "-b:v",
    "1400k",
    "-crf",
    "12",
    "-vf",
    "tpad=stop_mode=clone:stop_duration=3",
    "-c:a",
    "libopus",
    "-b:a",
    "80k",
    "-af",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
    "-t",
    String(totalDuration),
    path.join(artifacts, "workflow-final.webm"),
  ],
  { encoding: "utf8" },
);
if (encoded.status !== 0) throw new Error(encoded.stderr);
await copyFile(path.join(artifacts, 'workflow-final.webm'), path.join(media, 'workflow-demo.webm'));
console.log(
  `Narrated walkthrough created: ${totalDuration.toFixed(1)}s; 1440×1000; VP8 + Opus.`,
);
