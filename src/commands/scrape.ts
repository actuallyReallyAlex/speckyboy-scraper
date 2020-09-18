import fs from "fs-extra";
import path from "path";
import puppeteer from "puppeteer";

import { Article } from "../types";

const scrape = async (): Promise<void> => {
  // * Go to the earliest possible issue
  // * Find out how to scrape each article
  // * Get: url, title, description, thumbnail
  console.log("Scraping");

  const allArticles: Article[] = [];

  const startPage = 450;
  let currentPage = startPage;
  let endScrape = false;

  const browser = await puppeteer.launch({ headless: true });

  try {
    while (!endScrape) {
      // TODO - Multiple pages at a time
      const page = (await browser.pages())[0];
      console.log(`Current Page: ${currentPage}`);

      await page.goto(
        `https://speckyboy.com/weekly-news-for-designers-${currentPage}/`,
        {
          waitUntil: "networkidle0",
        }
      );

      const htmlText = await page.$eval("html", (element: Element) =>
        element.textContent ? element.textContent : ""
      );
      if (htmlText.includes("Page Not Found")) {
        endScrape = true;
        continue;
      }

      const articles = await page.$$(".post-content > p");
      articles.pop();

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const titleElement = await article.$("a");
        const imageElement = await article.$("img");
        const description = await article.evaluate((element: Element) =>
          element.textContent?.split(" – ")[1]?.slice(0, -1)
        );
        const url = await titleElement?.evaluate(
          (element: Element) => element.attributes.getNamedItem("href")?.value
        );
        const title = await titleElement?.evaluate((element: Element) =>
          element.textContent ? element.textContent : undefined
        );
        const imageUrl = await imageElement?.evaluate(
          (element: Element) => element.attributes.getNamedItem("src")?.value
        );

        allArticles.push({ description, imageUrl, title, url });
      }

      currentPage += 1;
    }

    await browser.close();
    console.log(`Number of Pages Scraped: ${currentPage - startPage}`);
    console.log(`Number of Articles: ${allArticles.length}`);

    await fs.writeJSON(
      path.join(__dirname, "../../articles.json"),
      allArticles
    );

    console.log(`File saved at ${path.join(__dirname, "../../articles.json")}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default scrape;
