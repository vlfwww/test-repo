class HeatingPage {
    constructor(page) {
        this.page = page;
        this.targetInput = page.locator('#targetTemp');
        this.currentInput = page.locator('#currentTemp');
        this.modeSelect = page.locator('#mode');
        this.checkButton = page.locator('#checkBtn');
        this.resultMsg = page.locator('#result');
        this.errorMsg = page.locator('#error');
    }

    async navigate() {
        await this.page.goto(`file://${process.cwd()}/src/index.html`);
    }

    async checkStatus(target, current, mode) {
        await this.targetInput.fill(target.toString());
        await this.currentInput.fill(current.toString());
        await this.modeSelect.selectOption(mode);
        await this.checkButton.click();
    }
}
module.exports = { HeatingPage };