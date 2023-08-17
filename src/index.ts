import puppeteer from "puppeteer"
import * as fs from 'fs'

const PAGES = 5;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  })
  const page = await browser.newPage()
  await page.goto("https://www.amazon.com/s?k=mechanical+keyboard+wireless+60+percent&sprefix=mechanical+keyboard+wireless")
  let pageNumber = 0
  while (pageNumber < PAGES) {
    await page.waitForSelector('[data-component-type="s-search-results"]', { visible: true });
    const productsHandles = await page.$$(
      "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item"
    );
    for (const productHandle of productsHandles) {
      let title = "Null";
      title = await page.evaluate(
        (el) => el.querySelector("h2 > a > span")?.textContent,
        productHandle
      );
      const price = await page.evaluate(
        (el) => el.querySelector(".a-price > .a-offscreen")?.textContent,
        productHandle
      );
      const img = await page.evaluate(
        (el) => el.querySelector(".s-image")?.getAttribute("src"),
        productHandle
      );
      const delivery = await page.evaluate(
        (el) => el.querySelector(".a-section > .a-size-base > span > .a-color-base")?.textContent,
        productHandle
      );
      const free = delivery?.includes("FREE") ?? false

      if (title !== "Null" && free && Number(price?.split('$')[1]) < 76) {
        fs.appendFile(
          "results.csv",
          `${title.replace(/,/g, ".")},${price},${img}\n`,
          function (err) {
            if (err) throw err;
          }
        );
      }
    }
    const nextPage = await page.waitForSelector(".s-pagination-next", { visible: true })
    if (nextPage) {
      await page.click(".s-pagination-next")
      pageNumber++
    }
  }
  await browser.close()
})()
