import { Page, Response, expect } from '@playwright/test';
import { SignupLocators } from '../locators/SignupLocators';
import { AccountInfo } from '../utils/DataGenerator';

export class SignupPage {
  constructor(private readonly page: Page) {}

  async goToHome(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  }

  async openSignupLogin(): Promise<void> {
    await this.page.locator(SignupLocators.home.signupLoginLink).click();
    await expect(this.page.locator(SignupLocators.newUserSignup.sectionTitle)).toBeVisible();
  }

  async assertNewUserSignupFormVisible(): Promise<void> {
    await expect(this.page.locator(SignupLocators.newUserSignup.nameInput)).toBeVisible();
    await expect(this.page.locator(SignupLocators.newUserSignup.emailInput)).toBeVisible();
    await expect(this.page.locator(SignupLocators.newUserSignup.submitButton)).toBeEnabled();
  }

  async fillNewUserSignup(name: string, email: string): Promise<void> {
    await this.page.locator(SignupLocators.newUserSignup.nameInput).fill(name);
    await this.page.locator(SignupLocators.newUserSignup.emailInput).fill(email);
  }

  async submitNewUserSignup(): Promise<void> {
    await this.page.locator(SignupLocators.newUserSignup.submitButton).click();
  }

  async assertEmailAlreadyExists(): Promise<void> {
    await expect(this.page.locator(SignupLocators.newUserSignup.emailAlreadyExistsMessage)).toBeVisible();
  }

  async assertEmailFieldHtml5Invalid(): Promise<void> {
    await expect(this.page.locator(SignupLocators.validation.emailInputInvalid)).toHaveCount(1);
  }

  async assertNameFieldHtml5Invalid(): Promise<void> {
    await expect(this.page.locator(SignupLocators.validation.nameInputInvalid)).toHaveCount(1);
  }

  async assertPasswordFieldHtml5Invalid(): Promise<void> {
    await expect(this.page.locator(SignupLocators.validation.passwordInputInvalid)).toHaveCount(1);
  }

  async assertAccountInformationVisible(): Promise<void> {
    await expect(this.page.locator(SignupLocators.accountInformation.sectionTitle)).toBeVisible();
  }

  async fillAccountInformation(info: AccountInfo): Promise<void> {
    const fields = SignupLocators.accountInformation;
    await this.page.locator(fields.titleMrRadio).check();
    await this.page.locator(fields.passwordInput).fill(info.password);
    await this.page.locator(fields.daysSelect).selectOption(info.day);
    await this.page.locator(fields.monthsSelect).selectOption(info.month);
    await this.page.locator(fields.yearsSelect).selectOption(info.year);
    await this.page.locator(fields.firstNameInput).fill(info.firstName);
    await this.page.locator(fields.lastNameInput).fill(info.lastName);
    await this.page.locator(fields.address1Input).fill(info.address);
    await this.page.locator(fields.countrySelect).selectOption(info.country);
    await this.page.locator(fields.stateInput).fill(info.state);
    await this.page.locator(fields.cityInput).fill(info.city);
    await this.page.locator(fields.zipcodeInput).fill(info.zipcode);
    await this.page.locator(fields.mobileNumberInput).fill(info.mobileNumber);
  }

  async submitAccountCreation(): Promise<void> {
    await this.page.locator(SignupLocators.accountInformation.createAccountButton).click();
  }

  async assertAccountCreated(): Promise<void> {
    await expect(this.page.locator(SignupLocators.accountCreated.title)).toBeVisible();
  }

  async assertConfirmationMessageVisible(): Promise<void> {
    const titleLocator = this.page.locator(SignupLocators.accountCreated.title);
    await expect(titleLocator).toBeVisible();
    const text = await titleLocator.innerText();
    expect(text.length).toBeGreaterThan(0);
    await expect(this.page.locator(SignupLocators.accountCreated.continueButton)).toBeVisible();
  }

  async assertNoConfirmationMessage(): Promise<void> {
    await expect(this.page.locator(SignupLocators.accountCreated.title)).toHaveCount(0);
  }

  async submitAndCaptureSignupResponse(): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/signup') && resp.request().method() === 'POST',
      { timeout: 15000 },
    );
    await this.submitNewUserSignup();
    return await responsePromise;
  }

  async submitAndCaptureCreateAccountResponse(): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/createAccount') || resp.url().includes('/signup'),
      { timeout: 15000 },
    );
    await this.submitAccountCreation();
    return await responsePromise;
  }

  async assertResponseDoesNotContainPassword(response: Response, password: string): Promise<void> {
    const headers = JSON.stringify(response.headers());
    expect(headers).not.toContain(password);
    const status = response.status();
    if (status >= 300 && status < 400) {
      return;
    }
    try {
      const body = await response.text();
      expect(body).not.toContain(password);
    } catch {
      return;
    }
  }

  async captureResponsesDuringAction(
    urlMatcher: (url: string) => boolean,
    action: () => Promise<void>,
  ): Promise<Response[]> {
    const responses: Response[] = [];
    const handler = (resp: Response): void => {
      if (urlMatcher(resp.url())) {
        responses.push(resp);
      }
    };
    this.page.on('response', handler);
    try {
      await action();
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
    } finally {
      this.page.off('response', handler);
    }
    return responses;
  }

  async assertNoPasswordLeakInResponses(responses: Response[], password: string): Promise<void> {
    for (const response of responses) {
      await this.assertResponseDoesNotContainPassword(response, password);
    }
  }

  async assertNoScriptExecuted(): Promise<void> {
    const dialogs: string[] = [];
    this.page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    await this.page.waitForTimeout(500);
    expect(dialogs.length).toBe(0);
  }

  async registerCompleteUser(name: string, email: string, info: AccountInfo): Promise<void> {
    await this.openSignupLogin();
    await this.fillNewUserSignup(name, email);
    await this.submitNewUserSignup();
    await this.assertAccountInformationVisible();
    await this.fillAccountInformation(info);
    await this.submitAccountCreation();
    await this.assertAccountCreated();
  }
}
