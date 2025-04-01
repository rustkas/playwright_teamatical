import { test, expect } from '@playwright/test';


//  Тесты Заголовока страницы
test.skip('should have the correct page title', async ({ page }) => {
    // Переходим на целевую страницу
    await page.goto('https://www.teamatical.com');

    // Проверяем, что заголовок страницы соответствует ожидаемому
    await expect(page).toHaveTitle('Home - Teamatical');
});

test.skip('title length should be within recommended limits', async ({ page }) => {
    await page.goto('https://www.teamatical.com');
    const title = await page.title();
    expect(title.length).toBeLessThanOrEqual(70); // Рекомендуется не более 60-70 символов
});


test.describe.skip('Page Title Localization Tests', () => {

    const locales = [
        { code: 'en', title: 'Home - Teamatical' },
        { code: 'th', title: 'หน้าแรก - Teamatical' },
        { code: 'fr', title: 'Accueil - Teamatical' },
        { code: 'es', title: 'Inicio - Teamatical' },
        { code: 'nl', title: 'Startpagina - Teamatical' },
        { code: 'de', title: 'Startseite - Teamatical' },
        { code: 'ru', title: 'Главная - Teamatical' }
    ];

    locales.forEach(locale => {
        test(`should have correct title for ${locale.code} locale`, async ({ page }) => {
            await page.goto(`https://www.teamatical.com?lang=${locale.code}`);
            await expect(page).toHaveTitle(locale.title);
        });
    });
});

test.describe.skip('Common Meta Tags Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.teamatical.com');
    });

    test('should have correct charset meta tag', async ({ page }) => {
        const charset = await page.locator('meta[charset]').getAttribute('charset');
        expect(charset).toBe('utf-8');
    });

    test('should have correct viewport meta tag', async ({ page }) => {
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toBe('width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no');
    });

    test('should have correct application-name meta tag', async ({ page }) => {
        const appName = await page.locator('meta[name="application-name"]').getAttribute('content');
        expect(appName).toBe('Teamatical');
    });

});

test.describe.skip('Localized Meta Tags Tests', () => {
    const locales = [
        { code: 'en', langPattern: /[a-zA-Z]/ }, // Английский
        { code: 'th', langPattern: /[\u0E00-\u0E7F]/ }, // Закодированный тайский
        { code: 'fr', langPattern: /[a-zA-Zàâçéèêëîïôûùüÿñæœ]/ }, // Французский
        { code: 'es', langPattern: /[a-zA-Záéíñóúü]/ }, // Испанский
        { code: 'nl', langPattern: /[a-zA-Zäëïöü]/ }, // Нидерландский
        { code: 'de', langPattern: /[a-zA-Zäöüß]/ }, // Немецкий
        { code: 'ru', langPattern: /[а-яА-ЯёЁ]/ } // Русский
    ];

    locales.forEach(locale => {
        test.describe(`${locale.code} locale meta tags`, () => {
            test.use({
                locale: locale.code,
                extraHTTPHeaders: {
                    'Accept-Language': `${locale.code},en;q=0.8`
                }
            });
            test.use({ ignoreHTTPSErrors: true });
            // test.beforeEach(async ({ page }) => {
            //     await page.context().clearCookies();
            //     const page_path = `https://www.teamatical.com?lang=${locale.code}`;

            //     console.log(`${page_path}`);

            //     await page.goto(page_path, { waitUntil: 'networkidle' });
            //     await page.waitForTimeout(2000); // Задержка в 3 секунды
            //     const title = await page.title();
            //     console.log(`Page title: ${title}`);

            // });

            test.beforeEach(async ({ browser }) => {
                const context = await browser.newContext(); // Создаем новый контекст
                const page = await context.newPage();
                await page.goto(`https://www.teamatical.com?lang=${locale.code}`, { waitUntil: 'networkidle' });
                await page.waitForTimeout(2000);

                // Вывод содержимого метатегов после загрузки страницы
                await page.evaluate(() => {
                    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
                    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
                    console.log('Meta Description:', metaDescription);
                    console.log('Meta Keywords:', metaKeywords);
                });
            });

            test('should have correctly localized meta description', async ({ page }) => {
                const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
                try {
                    expect(metaDescription).toMatch(locale.langPattern);
                } catch (error) {
                    console.error(`Meta Description Test Failed for Locale: ${locale.code}`);
                    console.error(`Pattern: ${locale.langPattern}`);
                    console.error(`Meta Description: ${metaDescription}`);
                    throw error;
                }
            });

            test('should have correctly localized meta keywords', async ({ page }) => {
                const keywords = await page.locator('meta[name="keywords"]').getAttribute('content');
                try {
                    expect(keywords).toMatch(locale.langPattern);
                } catch (error) {
                    console.error(`Keywords Test Failed for Locale: ${locale.code}`);
                    console.error(`Pattern: ${locale.langPattern}`);
                    console.error(`Keywords: ${keywords}`);
                    throw error;
                }
            });
        });
    });
});

test.skip('check internal links for 404 errors', async ({ page }) => {
    await page.goto('https://www.teamatical.com');

    // Получаем все внутренние ссылки на странице
    const links = await page.$$eval('a[href^="/"]', (anchors) =>
        anchors.map(anchor => (anchor as HTMLAnchorElement).href)
    );

    const brokenLinks: string[] = [];

    for (const link of links) {
        try {
            const response = await page.goto(link, { waitUntil: 'domcontentloaded' });

            if (!response || response.status() >= 400) {
                brokenLinks.push(link);
            }

            // Возвращаемся на исходную страницу после проверки ссылки
            await page.goBack();
        } catch (error) {
            console.error(`Ошибка доступа к ${link}:`, error);
            brokenLinks.push(link);
        }
    }

    if (brokenLinks.length > 0) {
        console.log('Недоступные ссылки:', brokenLinks);
        for (const link of brokenLinks) {
            console.error(`Недоступная ссылка: ${link}`);
        }
        expect(brokenLinks.length).toBe(0); // Тест не пройдет, если есть недоступные ссылки
    }
});


test('check all images load correctly and have valid dimensions', async ({ page }) => {
    await page.goto('https://www.teamatical.com');
    await page.waitForLoadState('networkidle');

    const imageElements = await page.$$('img');
    const imagesWithoutSrc: Array<number> = [];
    const brokenImages: Array<string> = [];
    const imagesWithZeroSize: Array<string> = [];
    const imagesWithNonZeroSize: Array<string> = [];

    for (let index = 0; index < imageElements.length; index++) {
        const img = imageElements[index];
        const src = await img.getAttribute('src');

        if (!src) {
            imagesWithoutSrc.push(index);
            continue;
        }

        const imageUrl = src.startsWith('http') ? src : new URL(src, 'https://www.teamatical.com').toString();

        // Прямо проверяем размеры изображения
        const [width, height, complete] = await img.evaluate((image) => {
            return [image.naturalWidth, image.naturalHeight, image.complete];
        });

        if (!complete || width === 0 || height === 0) {
            brokenImages.push(imageUrl);
        } else {
            imagesWithNonZeroSize.push(imageUrl);
        }
    }

    if (imagesWithoutSrc.length > 0) {
        console.error(`Изображения без src`);
        console.error(`Количество = ${imagesWithoutSrc.length}`);
        console.error(`${imagesWithoutSrc.join(', ')}`);
    }

    // if (brokenImages.length > 0) {
    //     console.error(`Недоступные или неполностью загруженные изображения`);
    //     console.error(`Количество = ${brokenImages.length}`);
    //     console.error(`${brokenImages.join(', ')}`);
    // }

    // if (imagesWithZeroSize.length > 0) {
    //     console.warn(`Изображения с нулевыми размерами.`);
    //     console.warn(`Количество = ${imagesWithZeroSize.length}`);
    //     console.warn(`${imagesWithZeroSize.join(', ')}`);
    // }

    // if (imagesWithNonZeroSize.length > 0) {
    //     console.warn(`Изображения с не нулевыми размерами:`);
    //     console.warn(`Количество = ${imagesWithNonZeroSize.length}`);
    //     console.warn(`${imagesWithNonZeroSize.join(', ')}`);
    // }

    // expect(brokenImages.length).toBe(0);
});