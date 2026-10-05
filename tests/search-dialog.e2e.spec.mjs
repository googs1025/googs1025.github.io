import { expect, test } from "@playwright/test";

test("enhanced search finds the indexed About page and restores focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("link", { name: "搜索文章" });

  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "全文搜索" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("searchbox", { name: "搜索关键词" }).fill("Kubernetes");

  const result = dialog.getByRole("link", {
    name: "江振瑜",
  });
  await expect(result).toBeVisible();
  const href = await result.getAttribute("href");
  expect(href).toBe("/about/");
  expect(new URL(href, page.url()).origin).toBe(new URL(page.url()).origin);

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("search baseline navigates to the Blog archive", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "搜索文章" }).click();

    await expect(page).toHaveURL(/\/blog\/$/);
    await expect(page.getByRole("heading", { name: "全部文章" })).toBeVisible();
  });
});
