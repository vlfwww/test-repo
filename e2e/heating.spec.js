const { test, expect } = require('@playwright/test');
const { HeatingPage } = require('./HeatingPage');

test.describe('UI Тесты: Контроллер отопления (Вариант 6)', () => {
    
    const scenarios = [
        { target: 20, current: 15, mode: 'Эко', expected: 'heating_on' },
        { target: 20, current: 18, mode: 'Эко', expected: 'heating_off' },
        { target: 22, current: 21, mode: 'Комфорт', expected: 'heating_on' },
        { target: 22, current: 21.8, mode: 'Комфорт', expected: 'heating_off' }
    ];

    for (const data of scenarios) {
        test(`Режим ${data.mode}: при ${data.current}°C ожидаем ${data.expected}`, async ({ page }) => {
            const heatingPage = new HeatingPage(page);
            await heatingPage.navigate();
            await heatingPage.checkStatus(data.target, data.current, data.mode);
            await expect(heatingPage.resultMsg).toContainText(data.expected);
        });
    }

    test('Проверка ошибки: Температура ниже абсолютного нуля', async ({ page }) => {
        const heatingPage = new HeatingPage(page);
        await heatingPage.navigate();
        await heatingPage.checkStatus(20, -300, 'Эко');
        await expect(heatingPage.errorMsg).toBeVisible();
        await expect(heatingPage.errorMsg).toContainText('ниже абсолютного нуля');
    });
});