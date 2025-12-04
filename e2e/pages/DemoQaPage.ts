import { Page, Locator } from '@playwright/test';
import { DemoQaLocators } from '../locators/DemoQaLocators';

const DEMOQA_BASE_URL = process.env.DEMOQA_BASE_URL || 'https://demoqa.com';

export interface TextBoxData {
  fullName: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
}

export interface PracticeFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  subject: string;
  currentAddress: string;
  state: string;
  city: string;
}

export class DemoQaPage {
  readonly page: Page;
  readonly locators: DemoQaLocators;

  // Home / navigation
  readonly cardElements: Locator;
  readonly menuTextBox: Locator;
  readonly menuForms: Locator;
  readonly menuPracticeForm: Locator;

  // Text Box form
  readonly inputFullName: Locator;
  readonly inputEmailTextBox: Locator;
  readonly inputCurrentAddressTextBox: Locator;
  readonly inputPermanentAddress: Locator;
  readonly btnSubmitTextBox: Locator;

  // Practice Form
  readonly inputFirstName: Locator;
  readonly inputLastName: Locator;
  readonly inputEmailPractice: Locator;
  readonly radioMaleLabel: Locator;
  readonly inputMobile: Locator;
  readonly inputDateOfBirth: Locator;
  readonly selectYear: Locator;
  readonly day2010Dec1: Locator;
  readonly inputSubjects: Locator;
  readonly checkboxSportsLabel: Locator;
  readonly inputCurrentAddressPractice: Locator;
  readonly dropdownState: Locator;
  readonly optionStateUttarPradesh: Locator;
  readonly dropdownCity: Locator;
  readonly optionCityLucknow: Locator;
  readonly btnSubmitPractice: Locator;

  // Modal
  readonly modalTitle: Locator;
  readonly btnCloseModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locators = new DemoQaLocators();

    // Home / navigation
    this.cardElements = this.page.locator(this.locators.cardElements);
    this.menuTextBox = this.page.locator(this.locators.menuTextBox);
    this.menuForms = this.page.locator(this.locators.menuForms);
    this.menuPracticeForm = this.page.locator(this.locators.menuPracticeForm);

    // Text Box form
    this.inputFullName = this.page.locator(this.locators.inputFullName);
    this.inputEmailTextBox = this.page.locator(this.locators.inputEmailTextBox);
    this.inputCurrentAddressTextBox = this.page.locator(this.locators.inputCurrentAddressTextBox);
    this.inputPermanentAddress = this.page.locator(this.locators.inputPermanentAddress);
    this.btnSubmitTextBox = this.page.locator(this.locators.btnSubmitTextBox);

    // Practice Form
    this.inputFirstName = this.page.locator(this.locators.inputFirstName);
    this.inputLastName = this.page.locator(this.locators.inputLastName);
    this.inputEmailPractice = this.page.locator(this.locators.inputEmailPractice);
    this.radioMaleLabel = this.page.locator(this.locators.radioMaleLabel);
    this.inputMobile = this.page.locator(this.locators.inputMobile);
    this.inputDateOfBirth = this.page.locator(this.locators.inputDateOfBirth);
    this.selectYear = this.page.locator(this.locators.selectYear);
    this.day2010Dec1 = this.page.locator(this.locators.day2010Dec1);
    this.inputSubjects = this.page.locator(this.locators.inputSubjects);
    this.checkboxSportsLabel = this.page.locator(this.locators.checkboxSportsLabel);
    this.inputCurrentAddressPractice = this.page.locator(this.locators.inputCurrentAddressPractice);
    this.dropdownState = this.page.locator(this.locators.dropdownState);
    this.optionStateUttarPradesh = this.page.locator(this.locators.optionStateUttarPradesh);
    this.dropdownCity = this.page.locator(this.locators.dropdownCity);
    this.optionCityLucknow = this.page.locator(this.locators.optionCityLucknow);
    this.btnSubmitPractice = this.page.locator(this.locators.btnSubmitPractice);

    // Modal
    this.modalTitle = this.page.locator(this.locators.modalTitle);
    this.btnCloseModal = this.page.locator(this.locators.btnCloseModal);
  }

  async gotoHome() {
    await this.page.goto(DEMOQA_BASE_URL);
  }

  async navigateToTextBox() {
    await this.page.getByText('Elements').click();
    await this.page.getByText('Text Box').click();
  }

  async fillTextBoxForm(data: TextBoxData) {
    await this.inputFullName.fill(data.fullName);
    await this.inputEmailTextBox.fill(data.email);
    await this.inputCurrentAddressTextBox.fill(data.currentAddress);
    await this.inputPermanentAddress.fill(data.permanentAddress);
    await this.btnSubmitTextBox.click();
  }

  async navigateToPracticeForm() {
    await this.page.getByText('Forms').click();
    await this.page.getByText('Practice Form').click();
  }

  async fillPracticeForm(data: PracticeFormData) {
    await this.inputFirstName.fill(data.firstName);
    await this.inputLastName.fill(data.lastName);
    await this.inputEmailPractice.fill(data.email);

    await this.radioMaleLabel.click();
    await this.inputMobile.fill(data.mobile);

    await this.inputDateOfBirth.click();
    await this.selectYear.selectOption('2010');
    await this.page.getByLabel('Choose Wednesday, December 1st, 2010').click();

    await this.inputSubjects.fill(data.subject);
    await this.checkboxSportsLabel.click();
    await this.inputCurrentAddressPractice.fill(data.currentAddress);

    await this.dropdownState.click();
    await this.optionStateUttarPradesh.click();
    await this.dropdownCity.click();
    await this.optionCityLucknow.click();

    await this.btnSubmitPractice.click();
  }

  async closeSubmissionModal() {
    await this.btnCloseModal.click({ force: true });
  }

  async screenshot(name: string) {
    await this.page.screenshot({
      path: `reports/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
