const { chromium } = require('playwright')

async function launchBrowser() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
  })
  return await context.newPage()
}

async function openBlogsPage(page) {
  await page.goto('https://www.commencis.com/')
  await page.hover('text=Insights') // Hover over Insights menu
  await page.click('text=Blog') // Click on Blog
  return page.url() === 'https://www.commencis.com/thoughts/' // Verify Blogs page
}

async function verifyBlogDetails(page, blog) {
  const titleElement = blog.locator('h3.t-entry-title a')

  if ((await titleElement.count()) > 0) {
    const title = await titleElement.textContent()
    console.log('Popular Blog Title:', title)

    // Click on the blog to navigate to its page
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), titleElement.click()])

    // Verify required elements on the blog page
    try {
      await page.waitForSelector('.heading-text.el-text h1', { timeout: 10000 })

      // Title
      const detailTitle = await page.$eval('.heading-text.el-text h1', (element) => element.textContent.trim())
      console.log('Blog Title:', detailTitle)

      // Content
      const detailContent = await page.$$eval('.uncode_text_column p', (elements) => elements.map((e) => e.textContent.trim()).join('\n'))
      console.log('Blog Content:', detailContent ? detailContent.slice(0, 100) + '...' : 'Content not found')

      // Date
      const detailDate = await page.$eval('.date-info', (element) => element.textContent.trim())
      console.log('Blog Date:', detailDate)

      // Stay Tuned Email Input and Button
      const emailInput = await page.$('input[type="email"][name="email-140"]')
      const stayTunedButton = await page.$('input[type="submit"][value="Stay Tuned"]')
      if (emailInput && stayTunedButton) {
        console.log('Stay Tuned Email Input and Button are present.')
      } else {
        console.error('Stay Tuned Email Input or Button is missing.')
      }

      // Author Verification
      await verifyAuthor(page)
    } catch (error) {
      console.error('An error occurred while verifying blog details:', error)
    }

    // Navigate back to the Blogs page
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.goBack()])
  } else {
    console.log(`Title not found for blog.`)
  }
}

async function verifyAuthor(page) {
  const authorElement = await page.$('.icon-box-heading > .h4')
  if (authorElement) {
    const authorText = await authorElement.textContent()
    console.log('Author:', authorText)

    if (authorText.includes('Commencis')) {
      const authorImage = await page.$('.icon-box-icon img')
      if (authorImage) {
        const authorImageSrc = await authorImage.getAttribute('src')
        console.log('Author Image:', authorImageSrc)
        if (
          authorImageSrc === 'https://cdn-www.commencis.com/wp-content/uploads/2018/03/favicon_commencis.png.webp' ||
          authorImageSrc === 'https://cdn-www.commencis.com/wp-content/uploads/2018/03/favicon_commencis.png'
        ) {
          console.log('Author image is verified as Commencis.')
        } else {
          console.error('Author image does not match the expected URL.')
        }
      } else {
        console.error('Author image element not found.')
      }
    }
  } else {
    console.error('Author not found for this blog.')
  }
}

// Main function to run the automation
;(async () => {
  const page = await launchBrowser()

  // Open Blogs page and verify it
  if (await openBlogsPage(page)) {
    console.log('Blogs page is open.')

    // Wait for the container with the ID to load
    await page.waitForSelector('#tab-1647339148-1-19', { timeout: 15000 })

    // Create a locator for the popular blogs
    const popularBlogsLocator = page.locator('#tab-1647339148-1-19 .tmb')

    // Get the count of popular blogs
    const blogCount = await popularBlogsLocator.count()
    console.log('Number of popular blogs found:', blogCount)

    for (let i = 0; i < blogCount; i++) {
      console.log(`\nVerifying Blog ${i + 1}`)
      const blog = popularBlogsLocator.nth(i)
      await verifyBlogDetails(page, blog)
    }

    // Wait before closing the browser
    console.log('Press any key to close the browser...')
    process.stdin.resume()
    process.stdin.on('data', async () => {
      await page.context().browser().close()
      process.exit()
    })
  } else {
    console.error('Failed to open Blogs page.')
    await page.context().browser().close()
  }
})()
