const puppeteer = require('puppeteer')
const { Pinecone } = require('@pinecone-database/pinecone');
import { NextResponse } from 'next/server';
const OpenAI = require('openai');

require('dotenv').config({ path: '.env.local' });

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
})
const index = pc.index('rag').namespace('ns1')
const openai = new OpenAI()

async function scrape_website(url) {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: true }); // Set headless to true for running without a UI
    const page = await browser.newPage();

    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Function to close the cookie modal if it appears
    async function closeCookieModal() {
        try {
            await page.waitForSelector('.CCPAModal__StyledCloseButton-sc-10x9kq-2', { timeout: 5000 });
            await page.click('.CCPAModal__StyledCloseButton-sc-10x9kq-2');
        } catch (error) {
            console.log("Done pressing more");
        }
    }

    async function clickUntilGone() {
        let previousReviewCount = 0;
        let clickCount = 0;
        while (true) {
            try {
                await page.waitForSelector('.PaginationButton__StyledPaginationButton-txi1dr-1', { timeout: 5000 });
                previousReviewCount = await page.evaluate(() => document.querySelectorAll('div.Rating__StyledRating-sc-1rhvpxz-1').length);
                await page.click('.PaginationButton__StyledPaginationButton-txi1dr-1');
                clickCount++;
                await page.waitForFunction(
                    (prevCount) => document.querySelectorAll('div.Rating__StyledRating-sc-1rhvpxz-1').length > prevCount,
                    {},
                    previousReviewCount
                );

                const newReviewCount = await page.evaluate(() => document.querySelectorAll('div.Rating__StyledRating-sc-1rhvpxz-1').length);

                if (newReviewCount === previousReviewCount) {
                    break;
                } else {
                    console.log(`${newReviewCount - previousReviewCount} new reviews loaded, continuing...`);
                }
            } catch (error) {
                break;
            }
        }
    }


    // Close the cookie modal if it appears
    await closeCookieModal();

    // Click the button until it's gone
    await clickUntilGone();

    const ratings = await page.evaluate(() => {
        const professor = document.querySelector('.NameTitle__Name-dowf0z-0')?.textContent.trim();
        const elements = document.querySelectorAll('div.Rating__StyledRating-sc-1rhvpxz-1');

        console.log(`Number of rating elements found: ${elements.length}`); // Debug: Number of elements found

        return Array.from(elements).map(element => {
            const subject = element.querySelector('.RatingHeader__StyledClass-sc-1dlkqw1-3')?.textContent.trim();
            const stars = element.querySelector('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2')?.textContent.trim();
            const review = element.querySelector('.Comments__StyledComments-dzzyvm-0')?.textContent.trim();

            console.log(element);
            console.log("Subject stars review");
            console.log(subject);
            console.log(stars);
            console.log(review);
            return { professor, subject, stars, review };
        });
    });

    console.log(ratings);
    console.log(`Found ${ratings.length} ratings`)

    // Close the browser
    await browser.close();

    return ratings;
}

export async function POST(req, res) {
    const data = await req.json()
    const url = data.url
    let scrapeResult;
    let result;
    try {
        scrapeResult = await scrape_website(url)
        console.log(scrapeResult)

        const items = []
        for (let i = 0; i < scrapeResult.length; i++) {
            const { professor, subject, stars, review } = scrapeResult[i]
            const embedding = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: review,
                encoding_format: 'float',
            })
            const vector = embedding.data[0].embedding

            items.push({
                id: `${professor}-${i}`,
                values: vector,
                metadata: { professor, review, subject, stars }
            })
        }
        result = await index.upsert(items);
    }
    catch (e) {
        console.log(e);
        return res.status(404).json({ success: false, result: e }, { status: 500 });
    }
    return NextResponse.json({ success: true, result }, { status: 200 });
}