import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("desktop-style file-to-dashboard journey", async ({ page }, info) => {
  await page.goto("/app/new-reconciliation");
  await expect(
    page.getByRole("heading", { name: "New reconciliation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue to mapping" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Use sample bank file" }).click();
  await page.getByRole("button", { name: "Use sample ledger file" }).click();
  await noOverflow(page);
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}-new-reconciliation.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Continue to mapping" }).click();
  await page
    .getByLabel("Bank statement reference", { exact: true })
    .selectOption("amount");
  await expect(
    page.getByRole("button", { name: "Continue to matching" }),
  ).toBeDisabled();
  await page
    .getByLabel("Bank statement reference", { exact: true })
    .selectOption("reference");
  await page.getByRole("button", { name: "Continue to matching" }).click();
  await expect(
    page.getByRole("heading", { name: "AI-assisted reconciliation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Run sample preview" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No backend job or AI request",
  );
  await expect(
    page.getByRole("heading", { name: "Your sample dashboard is ready" }),
  ).toBeVisible();
  await noOverflow(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => node.failureSummary),
    })),
  ).toEqual([]);
  await page.getByRole("link", { name: /Inspect matched records/ }).click();
  await expect(
    page.getByRole("heading", { name: "Reconciliation", exact: true }),
  ).toBeVisible();
});

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1,
    ),
  ).toBe(true);
}
async function navigate(page: Page, label: string, mobile: boolean) {
  if (mobile)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: label, exact: true })
    .click();
}

for (const [path, title] of [
  ["overview", "Overview"],
  ["imports", "Sources & imports"],
  ["mapping", "Field mapping"],
  ["workflows", "Workflows"],
  ["reconciliation", "Reconciliation"],
  ["exceptions", "Exceptions"],
  ["approvals", "Approvals"],
  ["audit", "Activity & reports"],
  ["settings", "Settings"],
]) {
  test(`${path}: rendering, accessibility and responsive layout`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/app/${path}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("Database not connected", { exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
    ).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `artifacts/screenshots/${info.project.name}-${path}.png`,
      fullPage: true,
    });
  });
}

test("sample import, mapping validation and rule preview", async ({ page }) => {
  await page.goto("/app/imports");
  await page.getByRole("button", { name: "New import", exact: true }).click();
  await page.getByRole("button", { name: "Load sample files" }).click();
  await expect(page.getByRole("status")).toContainText("No files uploaded");
  await page.getByRole("link", { name: "Continue to field mapping" }).click();
  const reference = page.getByLabel("Source column for Transaction reference");
  await reference.selectOption("amount");
  await expect(
    page.getByRole("button", { name: "Validate sample" }),
  ).toBeDisabled();
  await reference.selectOption("reference");
  await page.getByRole("button", { name: "Validate sample" }).click();
  await expect(page.getByRole("status")).toContainText("10 valid rows");
  await page.getByRole("link", { name: "Continue to workflow" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Matching rules", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preview sample" }).click();
  await page.getByRole("link", { name: "Open sample results" }).click();
  await expect(
    page.getByRole("heading", { name: "Reconciliation", exact: true }),
  ).toBeVisible();
});

test("search, pagination, missing records and keyboard drawer", async ({
  page,
}) => {
  await page.goto("/app/reconciliation");
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(
    page.getByRole("button", { name: /TX-1009/ }).first(),
  ).toBeVisible();
  await page.getByLabel("Search transactions").fill("not-a-reference");
  await expect(
    page.getByRole("heading", { name: "No matching records" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  const trigger = page.getByRole("button", {
    name: "View evidence for TX-1001",
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText("24800.00", { exact: true }).first(),
  ).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        Boolean(document.activeElement?.closest("dialog")),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.goto("/app/exceptions?record=TX-1010");
  await expect(
    page.getByRole("dialog").getByText("Counterpart missing", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Accept exact candidate" }),
  ).toHaveJSProperty("disabled", true);
  await noOverflow(page);
});

test("maker-checker demo flow and memory-only boundary", async ({
  page,
  isMobile,
}) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/api\//.test(request.url())) apiRequests.push(request.url());
  });
  await page.goto("/app/reconciliation?record=TX-1001");
  await page
    .getByLabel("Review reason")
    .fill("Verified source references, dates and exact amounts.");
  await page.getByRole("button", { name: "Submit demo proposal" }).click();
  await page.getByRole("link", { name: "Open approvals" }).click();
  await expect(
    page.getByRole("button", { name: "Approve in demo" }),
  ).toBeDisabled();
  await page.getByLabel("Demo role", { exact: true }).selectOption("approver");
  await page.getByRole("button", { name: "Approve in demo" }).click();
  await expect(
    page.getByText("Approved in demo", { exact: true }),
  ).toBeVisible();
  await navigate(page, "Activity & reports", isMobile);
  await expect(
    page.getByText("Review approved in demo · TX-1001", { exact: true }),
  ).toBeVisible();
  expect(apiRequests).toEqual([]);
  await page.reload();
  await expect(
    page.getByText("Review approved in demo · TX-1001", { exact: true }),
  ).toHaveCount(0);
});

test("reduced motion and unavailable capabilities", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/app/reconciliation?record=TX-1001");
  expect(
    await page
      .getByRole("dialog")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.goto("/app/audit");
  await expect(
    page.getByRole("button", { name: "Export report" }),
  ).toBeDisabled();
  await page.goto("/missing-page");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});

test("homepage, original video and accessible transcript", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every transaction.",
  );
  await page.locator("video").evaluate(async (element) => {
    const video = element as HTMLVideoElement;
    if (video.readyState < 1)
      await new Promise<void>((resolve, reject) => {
        video.addEventListener("loadedmetadata", () => resolve(), {
          once: true,
        });
        video.addEventListener(
          "error",
          () => reject(new Error("Video failed")),
          { once: true },
        );
      });
  });
  const metadata = await page.locator("video").evaluate((element) => ({
    duration: (element as HTMLVideoElement).duration,
    width: (element as HTMLVideoElement).videoWidth,
    autoplay: (element as HTMLVideoElement).autoplay,
  }));
  expect(metadata.duration).toBeGreaterThan(20);
  expect(metadata.width).toBe(1440);
  expect(metadata.autoplay).toBe(false);
  await page
    .getByText("Read the walkthrough transcript", { exact: true })
    .click();
  await expect(
    page.getByText(
      /Welcome to Pragya Flow Finance, your desktop reconciliation workspace/,
    ),
  ).toBeVisible();
  await noOverflow(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: `artifacts/screenshots/${info.project.name}-home.png`,
    fullPage: true,
  });
});
