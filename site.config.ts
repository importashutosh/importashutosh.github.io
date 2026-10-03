const siteConfig = {
  siteUrl: 'https://importashutosh.github.io',
  siteName: 'Kumar Ashutosh',
  analytics: { ga4MeasurementId: '' },
  searchConsole: { verificationToken: '' },
  ads: {
    enabled: false,
    adsensePublisherId: '',
    slots: { inArticle: '', afterIntro: '', sidebar: '' },
    showOnPages: ['blog-post'] as string[],
    minWordsForAds: 600,
  },
  newsletter: {
    provider: 'none' as 'resend' | 'none',
    workerUrl: '',
    turnstileSiteKey: '',
    audienceId: '',
    fromName: 'Kumar Ashutosh',
    fromEmail: '',
    replyTo: '',
    testRecipient: '',
    sendMode: 'excerpt' as 'excerpt' | 'full',
    cadence: 'per-post' as 'per-post' | 'weekly-digest',
    autoSend: true,
    requireApproval: false,
    footerAddress: '',
  },
  consent: { region: 'global', showBanner: true },
  contact: { formEndpoint: '' },
};

export default siteConfig;
