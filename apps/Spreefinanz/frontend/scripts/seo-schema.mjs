/**
 * Shared JSON-LD @graph builder for spreefinanz.de pages.
 */
const SITE = 'https://www.spreefinanz.de';

const BUSINESS_DE = {
  '@type': 'FinancialService',
  '@id': `${SITE}/#business`,
  name: 'spreefinanz.de | Havel Spree Finanz',
  alternateName: ['SpreeFinanz', 'Havel Spree Finanz'],
  description:
    'Unabhängiger Versicherungsmakler für Expats, Freelancer und digitale Nomaden – maßgeschneiderte internationale Versicherungslösungen seit 1996.',
  url: SITE,
  telephone: '+4915128937141',
  email: 'Buero@spreefinanz.de',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Dolziger Strasse 51',
    addressLocality: 'Berlin',
    postalCode: '10247',
    addressCountry: 'DE',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  sameAs: [
    'https://www.linkedin.com/in/sebastian-krger-a985a334/',
    'https://www.youtube.com/channel/UC97ojgjOiE_NDXQFzwq6Gxw',
  ],
  knowsAbout: [
    'Internationale Krankenversicherung',
    'Expat Insurance',
    'Freelancer Versicherung',
    'Digitale Nomaden Krankenversicherung',
    'Auslandskrankenversicherung',
  ],
};

const BUSINESS_EN = {
  ...BUSINESS_DE,
  description:
    'Independent insurance broker for expats, freelancers and digital nomads – tailored international insurance solutions since 1996.',
  knowsAbout: [
    'International health insurance',
    'Expat insurance',
    'Freelancer insurance',
    'Digital nomad health insurance',
    'Travel health insurance',
  ],
};

function websiteNode(lang) {
  const isEn = lang === 'en';
  return {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: 'spreefinanz.de',
    description: isEn
      ? 'Independent insurance broker for expats, freelancers & digital nomads worldwide.'
      : 'Unabhängiger Versicherungsmakler für Expats, Freelancer & digitale Nomaden weltweit.',
    publisher: { '@id': `${SITE}/#business` },
    inLanguage: ['de', 'en'],
  };
}

function webPageNode({ url, name, description, lang }) {
  return {
    '@type': 'WebPage',
    '@id': url,
    url,
    name,
    description,
    inLanguage: lang,
    isPartOf: { '@id': `${SITE}/#website` },
    provider: { '@id': `${SITE}/#business` },
  };
}

function serviceNode({ id, name, description, url, serviceType, channelUrl, lang }) {
  const node = {
    '@type': 'Service',
    '@id': id,
    name,
    description,
    url,
    serviceType,
    provider: { '@id': `${SITE}/#business` },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    inLanguage: lang,
  };
  if (channelUrl) {
    node.availableChannel = {
      '@type': 'ServiceChannel',
      serviceUrl: channelUrl,
    };
  }
  return node;
}

function webApplicationNode({ url, name, description, lang }) {
  return {
    '@type': 'WebApplication',
    '@id': `${url}#app`,
    name,
    description,
    url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web browser',
    browserRequirements: 'Requires JavaScript',
    inLanguage: lang,
    provider: { '@id': `${SITE}/#business` },
  };
}

export function buildSchemaGraph({ lang = 'de', webPage, service, webApplication } = {}) {
  const business = lang === 'en' ? BUSINESS_EN : BUSINESS_DE;
  const graph = [websiteNode(lang), business, webPageNode(webPage)];
  if (service) graph.push(serviceNode(service));
  if (webApplication) graph.push(webApplicationNode(webApplication));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
