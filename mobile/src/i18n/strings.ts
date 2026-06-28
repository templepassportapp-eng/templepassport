export type LangCode = 'en' | 'hi';

const strings = {
  en: {
    // Language screen
    chooseLanguage:    'Choose your language',
    languageSub:       'You can change this anytime in Settings.',
    continue:          'Continue',

    // Login — phone step
    enterMobile:       'Enter your mobile number',
    enterMobileSub:    "We'll send a one-time password to verify it.\nThis is how you'll sign in.",
    getOtp:            'Get OTP',
    continueGoogle:    'Continue with Google',
    termsNote:         'By continuing you agree to our ',
    terms:             'Terms',
    and:               ' & ',
    privacy:           'Privacy Policy',
    periodEnd:         '.',

    // Login — OTP step
    verifyNumber:      'Verify your number',
    otpSentTo:         'Enter the 6-digit code sent to ',
    edit:              'Edit',
    didntGet:          "Didn't get it? ",
    resendIn:          'Resend in ',
    resend:            'Resend',
    verifyContinue:    'Verify & continue',
    keepSigned:        'Keep me signed in on this device',

    // Profile setup
    setupPassport:     'Set up your passport',
    setupSub:          'This appears on your stamps and postcards.',
    fullName:          'FULL NAME',
    dateOfBirth:       'DATE OF BIRTH',
    city:              'CITY',
    saveContinue:      'Save & continue',
    namePlaceholder:   'Ananya Rao',
    cityPlaceholder:   'Varanasi, Uttar Pradesh',
    selectDate:        'Select date',
    done:              'Done',

    // Alerts
    invalidNumber:     'Invalid number',
    invalidNumberMsg:  'Please enter a valid 10-digit mobile number.',
    errorTitle:        'Error',
    otpError:          'Could not send OTP. Is the backend running?',
    incorrectCode:     'Incorrect code',
    incorrectCodeMsg:  'The OTP you entered is wrong or expired. Try again.',
    nameRequired:      'Name required',
    nameRequiredMsg:   'Please enter your full name.',
    saveError:         'Could not save profile. Please try again.',
    comingSoon:        'Coming soon',
    googleComingSoon:  'Google sign-in will be available soon.',

    // Tabs
    home:     'Home',
    search:   'Search',
    journey:  'Journey',
    passport: 'Passport',
    feed:     'Feed',
    you:      'You',
  },

  hi: {
    // Language screen
    chooseLanguage:    'अपनी भाषा चुनें',
    languageSub:       'आप इसे सेटिंग में कभी भी बदल सकते हैं।',
    continue:          'जारी रखें',

    // Login — phone step
    enterMobile:       'अपना मोबाइल नंबर दर्ज करें',
    enterMobileSub:    'हम इसे सत्यापित करने के लिए एक बार का पासवर्ड भेजेंगे।\nइसी से आप साइन इन करेंगे।',
    getOtp:            'OTP प्राप्त करें',
    continueGoogle:    'Google से जारी रखें',
    termsNote:         'जारी रखकर आप हमारी ',
    terms:             'शर्तें',
    and:               ' और ',
    privacy:           'गोपनीयता नीति',
    periodEnd:         ' से सहमत हैं।',

    // Login — OTP step
    verifyNumber:      'अपना नंबर सत्यापित करें',
    otpSentTo:         'पर भेजा गया 6 अंकों का कोड दर्ज करें ',
    edit:              'बदलें',
    didntGet:          'कोड नहीं मिला? ',
    resendIn:          'पुनः भेजें ',
    resend:            'पुनः भेजें',
    verifyContinue:    'सत्यापित करें और जारी रखें',
    keepSigned:        'इस डिवाइस पर साइन इन रहें',

    // Profile setup
    setupPassport:     'अपना पासपोर्ट सेट करें',
    setupSub:          'यह आपके स्टैंप और पोस्टकार्ड पर दिखेगा।',
    fullName:          'पूरा नाम',
    dateOfBirth:       'जन्म तिथि',
    city:              'शहर',
    saveContinue:      'सहेजें और जारी रखें',
    namePlaceholder:   'अनन्या राव',
    cityPlaceholder:   'वाराणसी, उत्तर प्रदेश',
    selectDate:        'तारीख चुनें',
    done:              'हो गया',

    // Alerts
    invalidNumber:     'अमान्य नंबर',
    invalidNumberMsg:  'कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें।',
    errorTitle:        'त्रुटि',
    otpError:          'OTP नहीं भेजा जा सका। क्या बैकएंड चल रहा है?',
    incorrectCode:     'गलत कोड',
    incorrectCodeMsg:  'आपने जो OTP दर्ज किया वह गलत या समाप्त हो चुका है।',
    nameRequired:      'नाम आवश्यक है',
    nameRequiredMsg:   'कृपया अपना पूरा नाम दर्ज करें।',
    saveError:         'प्रोफ़ाइल सहेजी नहीं जा सकी। पुनः प्रयास करें।',
    comingSoon:        'जल्द आ रहा है',
    googleComingSoon:  'Google साइन-इन जल्द उपलब्ध होगा।',

    // Tabs
    home:     'होम',
    search:   'खोजें',
    journey:  'यात्रा',
    passport: 'पासपोर्ट',
    feed:     'फ़ीड',
    you:      'आप',
  },
} as const;

export type StringKey = keyof typeof strings.en;
export default strings;
