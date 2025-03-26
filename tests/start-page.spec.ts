import { test, expect } from '@playwright/test';


// //  Тесты Заголовока страницы
// test('should have the correct page title', async ({ page }) => {
//     // Переходим на целевую страницу
//     await page.goto('https://www.teamatical.com');

//     // Проверяем, что заголовок страницы соответствует ожидаемому
//     await expect(page).toHaveTitle('Home - Teamatical');
// });

// test('title length should be within recommended limits', async ({ page }) => {
//     await page.goto('https://www.teamatical.com');
//     const title = await page.title();
//     expect(title.length).toBeLessThanOrEqual(70); // Рекомендуется не более 60-70 символов
// });


// test.describe('Page Title Localization Tests', () => {

//     const locales = [
//         { code: 'en', title: 'Home - Teamatical' },
//         { code: 'th', title: 'หน้าแรก - Teamatical' }, 
//         { code: 'fr', title: 'Accueil - Teamatical' }, 
//         { code: 'es', title: 'Inicio - Teamatical' }, 
//         { code: 'nl', title: 'Startpagina - Teamatical' }, 
//         { code: 'de', title: 'Startseite - Teamatical' }, 
//         { code: 'ru', title: 'Главная - Teamatical' } 
//     ];

//     locales.forEach(locale => {
//         test(`should have correct title for ${locale.code} locale`, async ({ page }) => {
//             await page.goto(`https://www.teamatical.com?lang=${locale.code}`);
//             await expect(page).toHaveTitle(locale.title);
//         });
//     });
// });

// test.describe('Common Meta Tags Tests', () => {
  
//     test.beforeEach(async ({ page }) => {
//       await page.goto('https://www.teamatical.com');
//     });
  
//     test('should have correct charset meta tag', async ({ page }) => {
//       const charset = await page.locator('meta[charset]').getAttribute('charset');
//       expect(charset).toBe('utf-8');
//     });
  
//     test('should have correct viewport meta tag', async ({ page }) => {
//       const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
//       expect(viewport).toBe('width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no');
//     });
  
//     test('should have correct application-name meta tag', async ({ page }) => {
//       const appName = await page.locator('meta[name="application-name"]').getAttribute('content');
//       expect(appName).toBe('Teamatical');
//     });
  
//   });

  test.describe('Localized Meta Tags Tests', () => {
    const locales = [
    //   { code: 'en', langPattern: /[a-zA-Z]/ }, // Английский
      { code: 'th', langPattern: /&#xE\d{2};/ }, // Закодированный тайский
    //   { code: 'fr', langPattern: /[a-zA-Zàâçéèêëîïôûùüÿñæœ]/ }, // Французский
    //   { code: 'es', langPattern: /[a-zA-Záéíñóúü]/ }, // Испанский
    //   { code: 'nl', langPattern: /[a-zA-Zäëïöü]/ }, // Нидерландский
    //   { code: 'de', langPattern: /[a-zA-Zäöüß]/ }, // Немецкий
    //   { code: 'ru', langPattern: /[а-яА-ЯёЁ]/ } // Русский
    ];
  
    locales.forEach(locale => {
        test.describe(`${locale.code} locale meta tags`, () => {
          test.beforeEach(async ({ page }) => {
            await page.goto(`https://www.teamatical.com?lang=${locale.code}`);
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