const siteConfig = {
  siteUrl: 'https://importashutosh.github.io',
  siteName: 'Kumar Ashutosh',
  analytics: { ga4MeasurementId: '' },
  searchConsole: { verificationToken: '' },
  ads: {
    enabled: false,
    adsensePublisherId: '',
    slots: { inArticle: '', afterPost: '' },
    showOnPages: [] as string[],
    minWordsForAds: 0,
  },
  newsletter: {
    provider: '',
    workerUrl: '',
    turnstileSiteKey: '',
    audienceId: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    testRecipient: '',
    sendMode: '',
    cadence: '',
    autoSend: false,
    requireApproval: true,
    footerAddress: '',
  },
  consent: { region: '', showBanner: false },
  contact: { formEndpoint: '' },
};

export default siteConfig;
