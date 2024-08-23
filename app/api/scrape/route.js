const puppeteer = require('puppeteer');

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false }); // Set headless to true for running without a UI
    const page = await browser.newPage();

    console.log("Browser launched");

    // Navigate to the page
    await page.goto('https://www.ratemyprofessors.com/professor/394782', { waitUntil: 'networkidle2' });

    console.log("Navigated to page");

    // Function to close the cookie modal if it appears
    async function closeCookieModal() {
        try {
            await page.waitForSelector('.CCPAModal__StyledCloseButton-sc-10x9kq-2', { timeout: 5000 });
            await page.click('.CCPAModal__StyledCloseButton-sc-10x9kq-2');
            console.log("Closed cookies modal");
        } catch (error) {
            console.log("Cookies modal not found");
        }
    }

    async function clickUntilGone() {
        let previousReviewCount = 0;
        let clickCount = 0;
        while (true) {
            try {
                console.log("Looking for 'Show More' button");
                await page.waitForSelector('.PaginationButton__StyledPaginationButton-txi1dr-1', { timeout: 5000 });
                console.log("'Show More' button found, clicking...");
                previousReviewCount = await page.evaluate(() => document.querySelectorAll('div.Rating__StyledRating-sc-1rhvpxz-1').length);
                await page.click('.PaginationButton__StyledPaginationButton-txi1dr-1');
                clickCount++;
                console.log(`'Show More' button clicked ${clickCount} times...`);
                
                console.log("Waiting for 5 seconds...");
                await page.waitForFunction(
                    (prevCount) => document.querySelectorAll('div.Rating__StyledRating-sc-1rhvpxz-1').length > prevCount,
                    {},
                    previousReviewCount
                );
                console.log("5 second wait completed");
                
                const newReviewCount = await page.evaluate(() => document.querySelectorAll('div.Rating__StyledRating-sc-1rhvpxz-1').length);
                console.log(`Previous review count: ${previousReviewCount}, New review count: ${newReviewCount}`);
                
                if (newReviewCount === previousReviewCount) {
                    console.log("No new content loaded after clicking. Breaking the loop.");
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


})();
