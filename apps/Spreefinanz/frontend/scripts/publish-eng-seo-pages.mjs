#!/usr/bin/env node
/**
 * Creates EN pages for new DE content, fixes DE hreflang/schema,
 * adds JSON-LD to insurance-check pages.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSchemaGraph } from './seo-schema.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.spreefinanz.de';

const IMG =
  'https://res.cloudinary.com/dqcdbdt4v/image/upload/f_auto,q_auto/spreefinanz/local-cdn/content/pages/19259/marketing/standard.jpg';

const PAGE_CONFIG = {
  rechtsschutz: {
    deFile: 'rechtsschutz_expats.html',
    enFile: 'ENG/expat_legal_protection.html',
    deUrl: `${SITE}/rechtsschutz_expats`,
    enUrl: `${SITE}/ENG/expat_legal_protection`,
    deTitle: 'Rechtsschutz Expats – Internationaler Rechtsschutz im Ausland | spreefinanz.de',
    enTitle: 'Expat Legal Protection – International Legal Cover Abroad | spreefinanz.de',
    deDesc:
      'Weltweiter Rechtsschutz für Expats, Auswanderer und digitale Nomaden: langfristige Absicherung bei rechtlichen Streitigkeiten im Ausland. Persönliche Beratung durch Spreefinanz.',
    enDesc:
      'Worldwide legal protection for expats, emigrants and digital nomads: long-term cover for legal disputes abroad. Personal advice from Spreefinanz.',
    deServiceType: 'Rechtsschutzversicherung für Expats',
    enServiceType: 'Legal expenses insurance for expats',
    deServiceName: 'Rechtsschutz Expats',
    enServiceName: 'Expat Legal Protection',
    channelUrl: 'https://oapp.bdae.com/de/expat-legal-preisermittlung?m=1&mid=M244843',
    dePageClass: 'page-1290200 mainparent-page-1241194 parent-page-1241194',
    enPageClass: 'page-1290200-en mainparent-page-1311303 parent-page-1311303',
    dePagetitle: 'Rechtsschutz Expats',
    enPagetitle: 'Expat Legal Protection',
    deEnToggle: 'ENG/expat_legal_protection',
    enDeToggle: '../rechtsschutz_expats',
    menuSection: 'abroad',
  },
  higermany: {
    deFile: 'higermany_pkv_voll_visum.html',
    enFile: 'ENG/higermany_pkv_full_visa.html',
    deUrl: `${SITE}/higermany_pkv_voll_visum`,
    enUrl: `${SITE}/ENG/higermany_pkv_full_visa`,
    deTitle: 'Hi.Germany PKV Voll Visum | Hallesche / ALH Group | spreefinanz.de',
    enTitle: 'Hi.Germany Full Private Health Insurance | Hallesche / ALH Group | spreefinanz.de',
    deDesc:
      'Hi.Germany: private Krankenvollversicherung der Hallesche für internationale Fachkräfte in Deutschland – visumssicher, flexibel kündbar, digital abschließbar.',
    enDesc:
      'Hi.Germany: Hallesche private full health insurance for international professionals in Germany – visa-compliant, flexible cancellation, digital application.',
    deServiceType: 'Private Krankenversicherung',
    enServiceType: 'Private health insurance',
    deServiceName: 'Hi.Germany PKV Voll Visum',
    enServiceName: 'Hi.Germany Full Private Health Insurance',
    channelUrl:
      'https://hallesche-health-insurance.de/?brokerID=637384&brokerSubID=&brokerEmail=buero@spreefinanz.de',
    dePageClass: 'page-1290301 mainparent-page-1241193 parent-page-1288743',
    enPageClass: 'page-1290301-en mainparent-page-1311286 parent-page-1311287',
    dePagetitle: 'HiGermany PKV Voll Visum',
    enPagetitle: 'Hi.Germany Full Visa PKV',
    deEnToggle: 'ENG/higermany_pkv_full_visa',
    enDeToggle: '../higermany_pkv_voll_visum',
    menuSection: 'health',
  },
  hallesche: {
    deFile: 'hallesche_zusatzversicherungen_gkv.html',
    enFile: 'ENG/hallesche_supplementary_gkv.html',
    deUrl: `${SITE}/hallesche_zusatzversicherungen_gkv`,
    enUrl: `${SITE}/ENG/hallesche_supplementary_gkv`,
    deTitle: 'Hallesche Zusatzversicherungen zur GKV | spreefinanz.de',
    enTitle: 'Hallesche Supplementary Insurance for Statutory Health (GKV) | spreefinanz.de',
    deDesc:
      'Hallesche Zusatzversicherungen für GKV-Versicherte in Deutschland: Zahn, Krankenhaus, Krankengeld.plus und ambulantes Upgrade – digital beraten und abschließen.',
    enDesc:
      'Hallesche supplementary insurance for statutory health (GKV) members in Germany: dental, hospital, sick pay and outpatient upgrades – apply online.',
    deServiceType: 'Zusatzkrankenversicherung',
    enServiceType: 'Supplementary health insurance',
    deServiceName: 'Hallesche Zusatzversicherungen zur GKV',
    enServiceName: 'Hallesche Supplementary GKV Insurance',
    channelUrl: `${SITE}/versicherungs-check#hallesche-alh`,
    dePageClass: 'page-1290302 mainparent-page-1241193 parent-page-1288743',
    enPageClass: 'page-1290302-en mainparent-page-1311286 parent-page-1311287',
    dePagetitle: 'Zusatzversicherungen zur GKV',
    enPagetitle: 'Supplementary GKV Insurance',
    deEnToggle: 'ENG/hallesche_supplementary_gkv',
    enDeToggle: '../hallesche_zusatzversicherungen_gkv',
    menuSection: 'health',
  },
};

function seoRolloutBlock({ lang, title, desc, url, deUrl, enUrl, schemaJson }) {
  const isEn = lang === 'en';
  const hrefDe = `<link rel="alternate" hreflang="de" href="${deUrl}"/>`;
  const hrefEn = `<link rel="alternate" hreflang="en" href="${enUrl}"/>`;
  const hrefDefault = `<link rel="alternate" hreflang="x-default" href="${deUrl}"/>`;
  return `<!-- seo-rollout-start --><meta name="robots" content="index,follow"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${title}"/><meta name="twitter:description" content="${desc}"/><meta name="twitter:image" content="${IMG}"/>${hrefDe}${hrefEn}${hrefDefault}<script type="application/ld+json">${schemaJson}</script><!-- seo-rollout-end -->`;
}

function patchDePage(cfg) {
  const file = path.join(ROOT, cfg.deFile);
  let html = fs.readFileSync(file, 'utf8');
  const schema = buildSchemaGraph({
    lang: 'de',
    webPage: { url: cfg.deUrl, name: cfg.deTitle, description: cfg.deDesc, lang: 'de' },
    service: {
      id: `${cfg.deUrl}#service`,
      name: cfg.deServiceName,
      description: cfg.deDesc,
      url: cfg.deUrl,
      serviceType: cfg.deServiceType,
      channelUrl: cfg.channelUrl,
      lang: 'de',
    },
  });
  const rollout = seoRolloutBlock({
    lang: 'de',
    title: cfg.deTitle,
    desc: cfg.deDesc,
    url: cfg.deUrl,
    deUrl: cfg.deUrl,
    enUrl: cfg.enUrl,
    schemaJson: schema,
  });
  html = html.replace(/<!-- seo-rollout-start -->[\s\S]*?<!-- seo-rollout-end -->/, rollout);
  fs.writeFileSync(file, html, 'utf8');
  console.log('patched DE schema', cfg.deFile);
}

function extractMainContent(deHtml) {
  const start = deHtml.indexOf('<!--###maincontent### begin -->');
  const end = deHtml.indexOf('<!--###maincontent### end -->');
  if (start === -1 || end === -1) throw new Error('maincontent markers missing');
  return deHtml.slice(start, end + '<!--###maincontent### end -->'.length);
}

function translateMainContent(html, lang, cfg) {
  if (lang === 'de') return html;
  const map = [
    ['<!--###maincontent### begin -->', '<!--###maincontent### begin -->'],
    ['Ich bin gerne für Sie da:', 'I am happy to be here for you'],
    ['Kontaktfoto', 'Contact photo'],
    ['Zum LinkedIn-Profil', 'LinkedIn profile'],
    ['Zum Youtube-Profil', 'YouTube channel'],
    ['direkt zum Seiteninhalt', 'Skip to main content'],
    ['Kontakt via WhatsApp', 'Contact via WhatsApp'],
    ['WhatsApp schreiben', 'Message on WhatsApp'],
    ['href="kontaktformular"', 'href="contact_form"'],
    ['href="versicherungs-check', 'href="insurance-check'],
    ['assets/whatsapplogo.png', '../assets/whatsapplogo.png'],
    ['Impressum', 'Imprint'],
    ['Datenschutz', 'Privacy'],
    ['Erstinformation', 'Initial information'],
    ['Beschwerden', 'Complaints'],
    ['alle Cookies erlauben', 'allow all cookies'],
    ['nur notwendige Cookies', 'necessary cookies only'],
    ['weitere Einstellungen', 'more settings'],
    ['Datenschutzerklärung', 'privacy policy'],
    ['Termin telefonisch vereinbaren', 'Book a phone appointment'],
    // rechtsschutz
    ['Weltweiter Rechtsschutz für Expats, Auswanderer und Digitale Nomaden', 'Worldwide legal protection for expats, emigrants and digital nomads'],
    ['Rechtliche Sicherheit – auch weit weg von Deutschland', 'Legal security – even far from Germany'],
    ['Wer dauerhaft oder für längere Zeit im Ausland lebt, arbeitet oder reist, ist häufig mit rechtlichen Herausforderungen konfrontiert, die von klassischen deutschen Rechtsschutzversicherungen nur eingeschränkt oder gar nicht abgedeckt werden.', 'Anyone living, working or travelling abroad for an extended period often faces legal challenges that classic German legal expenses policies only cover partially – or not at all.'],
    ['Ein Streit mit einem Vermieter in Thailand, ein Verkehrsunfall in Spanien, Probleme mit einem Dienstleister in Kanada oder arbeitsrechtliche Auseinandersetzungen während eines Auslandseinsatzes können schnell hohe Anwalts-, Gerichts- und Übersetzungskosten verursachen.', 'A dispute with a landlord in Thailand, a traffic accident in Spain, issues with a service provider in Canada or employment disputes during an overseas assignment can quickly lead to high legal, court and translation costs.'],
    ['Genau hier setzen internationale Rechtsschutzlösungen für Expats an.', 'International legal protection solutions for expats are designed exactly for these situations.'],
    ['Warum eine spezielle Auslands-Rechtsschutzversicherung?', 'Why dedicated international legal protection?'],
    ['Viele herkömmliche Rechtsschutzversicherungen bieten zwar eine Auslandsdeckung, diese ist jedoch häufig zeitlich begrenzt oder nur für Urlaubs- und Geschäftsreisen gedacht.', 'Many standard legal expenses policies include some overseas cover, but it is often time-limited or intended for holidays and business trips only.'],
    ['Für Expats, digitale Nomaden, Auswanderer und dauerhaft im Ausland lebende Deutsche sind spezielle Konzepte erforderlich, die einen langfristigen und weltweiten Versicherungsschutz ermöglichen.', 'Expats, digital nomads, emigrants and Germans living abroad long-term need dedicated concepts with long-term worldwide protection.'],
    ['Typische Leistungsbereiche', 'Typical areas of cover'],
    ['Schadenersatzrechtsschutz', 'Damages & compensation legal protection'],
    ['Vertrags- und Sachenrechtsschutz', 'Contract & property legal protection'],
    ['Strafrechtsschutz', 'Criminal legal protection'],
    ['Verkehrsrechtsschutz', 'Traffic legal protection'],
    ['Arbeitsrechtsschutz (je nach Tarif)', 'Employment legal protection (depending on plan)'],
    ['Kautionsleistungen im Ausland', 'Bail bond assistance abroad'],
    ['Übersetzungs- und Dolmetscherkosten', 'Translation & interpreter costs'],
    ['Unterstützung bei rechtlichen Verfahren weltweit', 'Support in legal proceedings worldwide'],
    ['Für wen eignet sich ein internationaler Rechtsschutz?', 'Who is international legal protection for?'],
    ['Deutsche Auswanderer', 'German emigrants'],
    ['Expats und entsandte Mitarbeiter', 'Expats and posted employees'],
    ['Digitale Nomaden', 'Digital nomads'],
    ['Remote arbeitende Selbstständige', 'Remote-working self-employed professionals'],
    ['Freiberufler im Ausland', 'Freelancers abroad'],
    ['Langzeitreisende', 'Long-term travellers'],
    ['Internationale Familien', 'International families'],
    ['Unsere Empfehlung', 'Our recommendation'],
    ['Wir prüfen gemeinsam Ihre individuelle Situation und finden die passende internationale Rechtsschutzlösung für Ihren Aufenthalt im Ausland.', 'We review your individual situation together and find the right international legal protection for your stay abroad.'],
    ['Jetzt Preisermittlung starten', 'Start price quote now'],
    ['Persönliche Beratung', 'Personal advice'],
    ['Wir beraten Sie gerne zu internationalen Rechtsschutzlösungen sowie weiteren wichtigen Absicherungen wie Auslandskrankenversicherung, Haftpflichtversicherung und Berufsunfähigkeitsversicherung.', 'We are happy to advise you on international legal protection and other important cover such as international health, liability and disability insurance.'],
    ['Passende Versicherung schnell finden', 'Find the right insurance quickly'],
    ['Beantworte wenige Fragen und erhalte in unter 30 Sekunden eine passende Empfehlung.', 'Answer a few questions and get a tailored recommendation in under 30 seconds.'],
    ['In 30 Sekunden deine Versicherung finden', 'Find your insurance in 30 seconds'],
    // higermany
    ['Hi.Germany – Die flexible Krankenvollversicherung', 'Hi.Germany – Flexible full private health insurance'],
    ['Willkommen in Deutschland! Wir regeln das mit deiner Krankenversicherung.', 'Welcome to Germany! We will sort out your health insurance.'],
    ['Wer aus dem Ausland nach Deutschland kommt, stellt schnell fest: Das deutsche Gesundheitssystem ist ein echter Bürokratie-Dschungel. Visum, Aufenthaltstitel, Arbeitgeber-Zuschuss – ohne den richtigen Versicherungsnachweis bewegt sich hier oft kein einziges Papier.', 'Anyone arriving in Germany from abroad quickly discovers that the healthcare system is a maze of bureaucracy. Visa, residence permit, employer subsidy – without the right insurance proof, paperwork often grinds to a halt.'],
    ['Genau für diese Lücke gibt es <strong>Hi.Germany</strong> von der Hallesche Krankenversicherung. Das ist eine private Krankenvollversicherung, die exakt auf internationale Fachkräfte, Freelancer und Expats zugeschnitten ist, die mit einem befristeten Aufenthaltstitel (bis zu 5 Jahre) in Deutschland leben und arbeiten wollen.', 'That is exactly where <strong>Hi.Germany</strong> from Hallesche health insurance comes in: private full cover tailored to international professionals, freelancers and expats with a temporary residence permit (up to 5 years) who want to live and work in Germany.'],
    ['Deine Vorteile auf einen Blick', 'Your benefits at a glance'],
    ['<strong>100&nbsp;% Visums-sicher:</strong> Erfüllt alle gesetzlichen Anforderungen für deinen Aufenthaltstitel in Deutschland.', '<strong>100% visa-compliant:</strong> Meets all legal requirements for your residence permit in Germany.'],
    ['<strong>Null Risiko:</strong> Keine Mindestvertragslaufzeit und ein monatliches Kündigungsrecht – perfekt, wenn deine Pläne sich ändern.', '<strong>No lock-in:</strong> No minimum contract term and monthly cancellation – perfect if your plans change.'],
    ['<strong>Kein Papierkram-Frust:</strong> Komplett digitale Online-Antragsstrecke und englischsprachiger Kundenservice.', '<strong>No paperwork hassle:</strong> Fully digital online application and English-speaking customer service.'],
    ['<strong>Chef zahlt mit:</strong> Der Tarif ist voll arbeitgeberzuschussfähig.', '<strong>Employer subsidy eligible:</strong> The plan qualifies for full employer contributions.'],
    ['<strong>Zukunftssicher:</strong> Wenn du länger in Deutschland bleibst, kannst du später einfach in die regulären Tarife der Hallesche wechseln.', '<strong>Future-proof:</strong> If you stay longer in Germany, you can switch to regular Hallesche plans later.'],
    ['Finde dein passendes Level', 'Find your level'],
    ['Hi.Medical S (Der Smarte)', 'Hi.Medical S (The smart choice)'],
    ['Dein verlässlicher, budgetfreundlicher Grundschutz für ambulante und stationäre Behandlungen im Krankenhaus.', 'Reliable, budget-friendly basic cover for outpatient and inpatient hospital treatment.'],
    ['Hi.Medical L (Der Komfortable)', 'Hi.Medical L (The comfortable option)'],
    ['Voller Schutz inklusive Einbettzimmer, Chefarztbehandlung, Naturheilverfahren und Psychotherapie.', 'Full cover including single room, chief physician treatment, naturopathy and psychotherapy.'],
    ['<strong>Tipp:</strong> Beide Tarife lassen sich flexibel mit dem Zahnschutz <strong>Hi.Dental</strong> (Basis oder Komfort) kombinieren, damit auch beim Zahnarzt alles glattgeht.', '<strong>Tip:</strong> Both plans can be combined with <strong>Hi.Dental</strong> dental cover (basic or comfort) for smooth visits to the dentist.'],
    ['Jetzt Hi.Germany Beratung anfragen', 'Request Hi.Germany advice now'],
    ['Selbst Angebot erstellen', 'Create your own quote'],
    ['Du möchtest direkt online ein unverbindliches Angebot für Hi.Germany erstellen? Nutze unsere digitale Abschlussstrecke der Hallesche (ALH Group):', 'Want to create a non-binding Hi.Germany quote online? Use our digital Hallesche (ALH Group) application channel:'],
    ['Jetzt Hi.Germany-Angebot selbst erstellen', 'Create your Hi.Germany quote now'],
    // hallesche
    ['Hallesche Zusatzversicherung – Das Upgrade für die GKV', 'Hallesche supplementary insurance – the GKV upgrade'],
    ['Gesetzlich versichert? Zeit für ein Upgrade!', 'Statutory health insurance? Time for an upgrade!'],
    ['Nicht jeder Expat in Deutschland braucht eine private Vollversicherung. Wenn du einen klassischen, sozialversicherungspflichtigen Job annimmst, landest du meist automatisch in der gesetzlichen Krankenversicherung (GKV).', 'Not every expat in Germany needs private full insurance. With a standard employed job you usually end up in statutory health insurance (GKV).'],
    ['Das Problem: Die GKV bietet eine solide Grundversorgung, hat aber spürbare Lücken. Begriffe wie „Wirtschaftlichkeitsgebot“ bedeuten oft: Standard-Behandlung, lange Wartezeiten und hohe Zuzahlungen aus eigener Tasche. Mit den maßgeschneiderten Zusatzversicherungen der Hallesche schließt du diese Lücken ganz entspannt.', 'The catch: GKV provides solid basic care but has noticeable gaps. Cost-efficiency rules often mean standard treatment, long waits and high out-of-pocket costs. Hallesche supplementary plans close those gaps easily.'],
    ['Die wichtigsten Upgrades für dein GKV-Setup', 'Key upgrades for your GKV setup'],
    ['<strong>Zahnzusatz (Hi.Dental):</strong> Die gesetzliche Kasse zahlt bei Zahnersatz oft nur einen winzigen Zuschuss. Wenn du hochwertige Implantate, Inlays oder einfach eine professionelle Zahnreinigung ohne Bauchschmerzen willst, holst du dir hier den Kostenschutz.', '<strong>Dental (Hi.Dental):</strong> Statutory cover often pays only a small share for dental prosthetics. For implants, inlays or professional cleaning without worry, this is your cost protection.'],
    ['<strong>Krankenhaus-Zusatz:</strong> Mach dein GKV-Krankenhausbett zum Privatpatienten-Zimmer. Inklusive Ein- oder Zweibettzimmer und freier Chefarztwahl, wenn es darauf ankommt.', '<strong>Hospital upgrade:</strong> Turn your GKV hospital stay into a private room with chief physician choice when it matters.'],
    ['<strong>Krankengeld.plus (Einkommensschutz):</strong> Nach 6 Wochen Krankheit endet die Lohnfortzahlung deines Arbeitgebers. Das gesetzliche Krankengeld ist deutlich niedriger als dein echtes Netto. Diese Lücke sichern wir ab, damit die Miete in Berlin weiter bezahlt wird.', '<strong>Sick pay plus (income protection):</strong> After 6 weeks of illness employer sick pay ends. Statutory sick pay is much lower than your net income. We close that gap so rent keeps getting paid.'],
    ['<strong>Ambulantes Upgrade:</strong> Zuschüsse für Brillen, Kontaktlinsen oder alternative Heilmethoden (Heilpraktiker), die deine gesetzliche Kasse standardmäßig ignoriert.', '<strong>Outpatient upgrade:</strong> Subsidies for glasses, contact lenses or alternative therapies your statutory fund typically does not cover.'],
    ['Warum Spreefinanz?', 'Why Spreefinanz?'],
    ['Wir sind nicht die verstaubte Versicherungsecke von nebenan. Wir prüfen dein Herkunftsland, deinen Aufenthaltsstatus und deine echten Pläne in Deutschland, um das perfekte Setup für dich zu bauen. Komplett digital, unkompliziert und auf Augenhöhe.', 'We are not a dusty insurance corner shop. We review your country of origin, residence status and real plans in Germany to build the right setup – fully digital, straightforward and on equal terms.'],
    ['Lücken schließen – Jetzt Beratung anfragen', 'Close the gaps – request advice now'],
    ['Direkt online berechnen und beantragen', 'Calculate and apply online'],
    ['Wähle die passende Zusatzversicherung – ein Klick öffnet die digitale Abschlussstrecke der Hallesche (ALH Group) mit Spreefinanz-Zuordnung. Alle Tarife auch übersichtlich auf der Seite <a href="insurance-check#hallesche-alh">Versicherungs-Check</a>.', 'Choose the right supplementary plan – one click opens the Hallesche (ALH Group) digital application with Spreefinanz attribution. All plans are also listed on <a href="insurance-check#hallesche-alh">Insurance Check</a>.'],
    ['Zahnzusatz (Hi.Dental)', 'Dental (Hi.Dental)'],
    ['Krankenhaus-Zusatz', 'Hospital supplementary'],
    ['Ambulantes Upgrade', 'Outpatient upgrade'],
    ['Krankengeld.plus / Einkommensschutz', 'Sick pay plus / income protection'],
    ['Studenten &amp; Spezialtarife', 'Students &amp; special plans'],
    ['Online abschließen →', 'Apply online →'],
    ['Solider Einstieg für Zahnbehandlung &amp; Prophylaxe', 'Solid entry for dental treatment &amp; prevention'],
    ['Erweiterter Zahnschutz mit höherem Leistungsniveau', 'Extended dental cover with higher benefits'],
    ['Kombi-Paket mit smartem Preis-Leistungs-Verhältnis', 'Combo package with smart value for money'],
    ['Umfangreicher Zahnschutz für höhere Ansprüche', 'Comprehensive dental cover for higher needs'],
    ['Premium-Paket mit sehr hoher Erstattung', 'Premium package with very high reimbursement'],
    ['Einfacher Online-Abschluss mit PLUSZ-Komponente', 'Simple online application with PLUSZ component'],
    ['Ein-/Zweibettzimmer &amp; Chefarzt im Krankenhaus', 'Single/twin room &amp; chief physician in hospital'],
    ['Vereinfachter Krankenhaus-Zusatz zum schnellen Start', 'Simplified hospital upgrade for a quick start'],
    ['Flexible ambulante Zusatzleistungen zur GKV', 'Flexible outpatient supplementary benefits for GKV'],
    ['Zuschüsse für Vorsorge &amp; Gesundheitsförderung', 'Subsidies for prevention &amp; health promotion'],
    ['Ambulantes Upgrade mit breitem Leistungsspektrum', 'Outpatient upgrade with broad benefits'],
    ['Brillen, Kontaktlinsen &amp; Sehhilfen-Zuschuss', 'Glasses, contact lenses &amp; vision aid subsidy'],
    ['Lohnlücke nach 6 Wochen Krankheit absichern', 'Cover income gap after 6 weeks of illness'],
    ['Ambulantes Upgrade speziell für Studierende', 'Outpatient upgrade for students'],
  ];
  let out = html;
  for (const [from, to] of map) out = out.split(from).join(to);
  return out;
}

function extractEngShell(section) {
  const templateFile =
    section === 'abroad'
      ? path.join(ROOT, 'ENG/liability_insurances.html')
      : path.join(ROOT, 'ENG/foyer.html');
  return fs.readFileSync(templateFile, 'utf8');
}

function buildEngMenu(shell, cfg) {
  let menu = shell;
  const hallescheBlock = `<li class="menusubitem lastitem" id="page-1290300-en" role="none"><a aria-label="Hallesche / ALH Group" href="higermany_pkv_full_visa" id="page-1290300-en-link" onclick="return false" role="menuitem">Hallesche / ALH Group</a><span class="submenutoggle"></span><ul aria-labelledby="page-1290300-en-link" role="menu"><li class="menusubitem firstitem" id="page-1290301-en" role="none"><a aria-label="Hi.Germany Full Visa PKV" href="higermany_pkv_full_visa" id="page-1290301-en-link" role="menuitem">Hi.Germany Full Visa PKV</a><span class="submenutoggle"></span></li><li class="menusubitem lastitem" id="page-1290302-en" role="none"><a aria-label="Supplementary GKV Insurance" href="hallesche_supplementary_gkv" id="page-1290302-en-link" role="menuitem">Supplementary GKV Insurance</a><span class="submenutoggle"></span></li></ul></li>`;
  const expatLegalItem = `<li class="menusubitem" id="page-1290200-en" role="none"><a aria-label="Expat Legal Protection" href="expat_legal_protection" id="page-1290200-en-link" role="menuitem">Expat Legal Protection</a><span class="submenutoggle"></span></li>`;

  if (!menu.includes('page-1290300-en')) {
    menu = menu.replace(
      /<li class="menusubitem lastitem" id="page-1311293" role="none"><a aria-label="Foyer" href="foyer" id="page-1311293-link" role="menuitem">Foyer<\/a><span class="submenutoggle"><\/span><\/li>/,
      `<li class="menusubitem" id="page-1311293" role="none"><a aria-label="Foyer" href="foyer" id="page-1311293-link" role="menuitem">Foyer</a><span class="submenutoggle"></span></li>${hallescheBlock}`
    );
  }
  if (!menu.includes('page-1290200-en')) {
    menu = menu.replace(
      /(<li class="menusubitem" id="page-1311316" role="none"><a aria-label="Liability Insurance" href="liability_insurances" id="page-1311316-link" role="menuitem">Liability Insurance<\/a><span class="submenutoggle"><\/span><\/li>)/,
      `$1${expatLegalItem}`
    );
  }
  return menu;
}

function buildEngPage(cfg) {
  const deHtml = fs.readFileSync(path.join(ROOT, cfg.deFile), 'utf8');
  let shell = extractEngShell(cfg.menuSection);
  shell = buildEngMenu(shell, cfg);

  const schema = buildSchemaGraph({
    lang: 'en',
    webPage: { url: cfg.enUrl, name: cfg.enTitle, description: cfg.enDesc, lang: 'en' },
    service: {
      id: `${cfg.enUrl}#service`,
      name: cfg.enServiceName,
      description: cfg.enDesc,
      url: cfg.enUrl,
      serviceType: cfg.enServiceType,
      channelUrl: cfg.channelUrl,
      lang: 'en',
    },
  });

  const rollout = seoRolloutBlock({
    lang: 'en',
    title: cfg.enTitle,
    desc: cfg.enDesc,
    url: cfg.enUrl,
    deUrl: cfg.deUrl,
    enUrl: cfg.enUrl,
    schemaJson: schema,
  });

  let main = extractMainContent(deHtml);
  main = translateMainContent(main, 'en', cfg);

  const head = `<!DOCTYPE html>

<html itemscope="" itemtype="https://schema.org/WebPage" lang="en">
<head>
<link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
    <link href="../style.20260528.css" rel="stylesheet"/>
    <link href="../style2.d4510679bb7f.css" media="print" onload="this.media='all'" rel="stylesheet"/>
    <noscript><link href="../style2.d4510679bb7f.css" rel="stylesheet"/></noscript>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
<title>${cfg.enTitle}</title>
<meta content="${cfg.enDesc}" name="description"/>
<meta content="strict-origin-when-cross-origin" name="referrer"/><meta content="width=device-width, initial-scale=1 maximum-scale=1" name="viewport"/>
<meta content="cm Homepage-Baukasten" name="generator"/>
<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge" /><![endif]-->
<link href="${cfg.enUrl}" rel="canonical"/><meta content="${cfg.enUrl}" property="og:url"/><meta content="en_US" property="og:locale"/><meta content="website" property="og:type"/><meta content="spreefinanz.de | Havel Spree Finanz" itemprop="name"/><meta content="${cfg.enTitle}" property="og:title"/><meta content="${cfg.enDesc}" property="og:description"/><meta content="${IMG}" property="og:image"/><meta content="1200" property="og:image:width"/><meta content="630" property="og:image:height"/><link href="../assets/local-cdn/storage/f26f73ba7f/favicon.png" rel="icon" sizes="48x48" type="image/png"/><link href="../assets/local-cdn/storage/f26f73ba7f/apple-touch-icon.png" rel="apple-touch-icon"/>
<script data-ehcookieblocker-obligatory="">
var googleMapsArray = [];
\tvar dontPlaceSubmenu = 1;

</script>
<!--USER:25259-->${rollout}</head>`;

  const bodyStart = shell.slice(shell.indexOf('<body'));
  let body = bodyStart.replace(/class="[^"]*"/, `class="designtemplate207 motif0 show_logo resp ${cfg.enPageClass} with-bootstrap-v5"`);
  body = body.replace(/<div class="pagetitle">[^<]*<\/div>/, `<div class="pagetitle">${cfg.enPagetitle}</div>`);
  body = body.replace(
    /<a aria-label="DE \/ EN" href="[^"]*" id="page-1257016-link"/,
    `<a aria-label="DE / EN" href="${cfg.enDeToggle}" id="page-1257016-link"`
  );

  const mainStart = body.indexOf('<!--###maincontent### begin -->');
  const mainEnd = body.indexOf('<!--###maincontent### end -->');
  if (mainStart === -1 || mainEnd === -1) throw new Error('shell missing maincontent');
  body =
    body.slice(0, mainStart) +
    main +
    body.slice(mainEnd + '<!--###maincontent### end -->'.length);

  const html = head + '\n' + body;
  fs.writeFileSync(path.join(ROOT, cfg.enFile), html, 'utf8');
  console.log('created', cfg.enFile);
}

function patchInsuranceCheck(fileRel, lang, title, desc, url, deUrl, enUrl) {
  const file = path.join(ROOT, fileRel);
  let html = fs.readFileSync(file, 'utf8');
  const schema = buildSchemaGraph({
    lang,
    webPage: { url, name: title, description: desc, lang },
    webApplication: { url, name: title.replace(/ \| spreefinanz\.de$/, ''), description: desc, lang },
    service: {
      id: `${url}#service`,
      name: lang === 'de' ? 'Versicherungs-Check' : 'Insurance Check',
      description: desc,
      url,
      serviceType: lang === 'de' ? 'Versicherungsberatung' : 'Insurance advisory',
      channelUrl: url,
      lang,
    },
  });
  const block = `<meta name="robots" content="index,follow"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${title}"/>
    <meta name="twitter:description" content="${desc}"/>
    <meta name="twitter:image" content="${IMG}"/>
    <script type="application/ld+json">${schema}</script>`;

  if (html.includes('application/ld+json')) {
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${schema}</script>`);
  } else {
    html = html.replace(
      /<link href="[^"]*apple-touch-icon[^"]*"\/>/,
      (m) => `${m}\n    ${block}`
    );
  }

  if (lang === 'en') {
    html = html.replace(
      /<meta content="Versicherungs-Check[^"]*" property="og:title"\/>/,
      `<meta content="${title}" property="og:title"/>`
    );
    html = html.replace(
      /<meta content="In 4 Schritten zur passenden International health insurance:[^"]*" property="og:description"\/>/,
      `<meta content="${desc}" property="og:description"/>`
    );
    html = html.replace(
      /<meta content="https:\/\/www\.spreefinanz\.de\/versicherungs-check" property="og:url"\/>/,
      `<meta content="${url}" property="og:url"/>`
    );
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('patched insurance check', fileRel);
}

function patchEngMenusGlobally() {
  const engDir = path.join(ROOT, 'ENG');
  for (const name of fs.readdirSync(engDir)) {
    if (!name.endsWith('.html')) continue;
    const file = path.join(engDir, name);
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('menutype4 responsive_dontslide')) continue;
    const next = buildEngMenu(html, {});
    if (next !== html) {
      fs.writeFileSync(file, next, 'utf8');
      console.log('menu updated', name);
    }
  }
}

for (const cfg of Object.values(PAGE_CONFIG)) {
  patchDePage(cfg);
  buildEngPage(cfg);
}

patchInsuranceCheck(
  'versicherungs-check.html',
  'de',
  'Versicherungs-Check – Finde deine passende Versicherung | spreefinanz.de',
  'In 4 Schritten zur passenden Auslandskrankenversicherung: Unser Versicherungs-Check ermittelt dein Profil und zeigt dir die besten Optionen.',
  `${SITE}/versicherungs-check`,
  `${SITE}/versicherungs-check`,
  `${SITE}/ENG/insurance-check`
);

patchInsuranceCheck(
  'ENG/insurance-check.html',
  'en',
  'Insurance Check – Find the Right Coverage for You | spreefinanz.de',
  'Find the right international health insurance in 4 steps: our Insurance Check identifies your profile and shows you the best options.',
  `${SITE}/ENG/insurance-check`,
  `${SITE}/versicherungs-check`,
  `${SITE}/ENG/insurance-check`
);

patchEngMenusGlobally();

console.log('Done.');
