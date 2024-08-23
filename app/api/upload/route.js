const puppeteer = require('puppeteer')
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const dotenv = require('dotenv');

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
})
const index = pc.index('rag').namespace('ns1')
const openai = new OpenAI()

async function scrape_website() {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false }); // Set headless to true for running without a UI
    const page = await browser.newPage();

    // Navigate to the page
    const url = 'https://www.ratemyprofessors.com/professor/394782'
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

async function POST(req) {
    const data = await req.json()
    pc.create_index(
        name="rag", dimension=1536, metric="cosine", spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
    const result = await scrape_website()
    for ({ professor, subject, stars, review } in result) {
        const index = pc.index('rag').namespace('ns1')
        const openai = new OpenAI()
    }
    console.log(result)
}


POST()