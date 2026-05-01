export const SignupLocators = {
  home: {
    signupLoginLink: 'a[href="/login"]',
  },
  newUserSignup: {
    sectionTitle: 'h2:has-text("New User Signup!")',
    nameInput: 'input[data-qa="signup-name"]',
    emailInput: 'input[data-qa="signup-email"]',
    submitButton: 'button[data-qa="signup-button"]',
    emailAlreadyExistsMessage: 'p:has-text("Email Address already exist!")',
  },
  accountInformation: {
    sectionTitle: 'b:has-text("Enter Account Information")',
    titleMrRadio: '#id_gender1',
    passwordInput: 'input[data-qa="password"]',
    daysSelect: 'select[data-qa="days"]',
    monthsSelect: 'select[data-qa="months"]',
    yearsSelect: 'select[data-qa="years"]',
    firstNameInput: 'input[data-qa="first_name"]',
    lastNameInput: 'input[data-qa="last_name"]',
    address1Input: 'input[data-qa="address"]',
    countrySelect: 'select[data-qa="country"]',
    stateInput: 'input[data-qa="state"]',
    cityInput: 'input[data-qa="city"]',
    zipcodeInput: 'input[data-qa="zipcode"]',
    mobileNumberInput: 'input[data-qa="mobile_number"]',
    createAccountButton: 'button[data-qa="create-account"]',
  },
  accountCreated: {
    title: 'b:has-text("Account Created!")',
    continueButton: 'a[data-qa="continue-button"]',
  },
  validation: {
    nameInputInvalid: 'input[data-qa="signup-name"]:invalid',
    emailInputInvalid: 'input[data-qa="signup-email"]:invalid',
    passwordInputInvalid: 'input[data-qa="password"]:invalid',
  },
} as const;

export const SiteEndpoints = {
  signupApi: '**/signup',
  createAccountApi: '**/api/createAccount',
} as const;
