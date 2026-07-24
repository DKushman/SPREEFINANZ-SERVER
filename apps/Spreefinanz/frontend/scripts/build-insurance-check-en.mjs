#!/usr/bin/env node
/**
 * Regenerate ENG/insurance-check.html from versicherungs-check.html (EN translation).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dePath = path.join(root, 'versicherungs-check.html');
const enMenuPath = path.join(root, 'ENG', 'insurance-check.html');
const outPath = path.join(root, 'ENG', 'insurance-check.html');

let html = fs.readFileSync(dePath, 'utf8');
const oldEn = fs.readFileSync(enMenuPath, 'utf8');

// ENG header block (menu + title) from existing EN page
const headerMatch = oldEn.match(
  /<div class="element_wrapper wrap_header">[\s\S]*?<\/header><\/div>\s*<a id="whatsapp-widget"/
);
if (!headerMatch) throw new Error('Could not extract ENG header from insurance-check.html');
let engHeader = headerMatch[0];
engHeader = engHeader.replace(
  /<li class="menuitem" id="page-1241841"/,
  '<li class="menuitem subactive" id="page-1241841"'
);
engHeader = engHeader.replace(
  /<li class="menusubitem" id="page-versicherungs-check"/,
  '<li class="menusubitemactive" id="page-versicherungs-check"'
);

const deHeaderMatch = html.match(
  /<div class="element_wrapper wrap_header">[\s\S]*?<\/header><\/div>\s*<a id="whatsapp-widget"/
);
if (!deHeaderMatch) throw new Error('Could not extract DE header');
html = html.replace(deHeaderMatch[0], engHeader);

// Head / meta
html = html.replace(/<html lang="de">/, '<html lang="en">');
html = html.replace(
  /<title>[\s\S]*?<\/title>/,
  '<title>Insurance Check – Find the Right Coverage for You | spreefinanz.de</title>'
);
html = html.replace(
  /content="In 4 Schritten[\s\S]*?" name="description"\/>/,
  'content="Find the right international health insurance in 4 steps: our Insurance Check identifies your profile and shows you the best options." name="description"/>'
);
html = html.replace(
  /<link href="https:\/\/www\.spreefinanz\.de\/versicherungs-check" rel="canonical"\/>/,
  '<link href="https://www.spreefinanz.de/ENG/insurance-check" rel="canonical"/>'
);
html = html.replace(
  /hreflang="de" href="https:\/\/www\.spreefinanz\.de\/versicherungs-check"/,
  'hreflang="de" href="https://www.spreefinanz.de/versicherungs-check"'
);
html = html.replace(
  /hreflang="en" href="https:\/\/www\.spreefinanz\.de\/ENG\/insurance-check"/,
  'hreflang="en" href="https://www.spreefinanz.de/ENG/insurance-check"'
);
html = html.replace(/content="de_DE"/, 'content="en_US"');
html = html.replace(
  /property="og:title" content="Versicherungs-Check[\s\S]*?"/,
  'property="og:title" content="Insurance Check – Find the Right Coverage for You | spreefinanz.de"'
);
html = html.replace(
  /property="og:description" content="In 4 Schritten[\s\S]*?"/,
  'property="og:description" content="Find the right international health insurance in 4 steps: our Insurance Check identifies your profile and shows you the best options."'
);
html = html.replace(
  /property="og:url" content="https:\/\/www\.spreefinanz\.de\/versicherungs-check"/,
  'property="og:url" content="https://www.spreefinanz.de/ENG/insurance-check"'
);

html = html.replace(
  /<link href="style\.[^"]+\.css" rel="stylesheet"\/>/,
  '<link href="../style.css" rel="stylesheet"/>'
);
html = html.replace(
  /<link href="seoseiten\.[^"]+\.css" rel="stylesheet"\/>/,
  '<link href="../seoseiten.css" rel="stylesheet"/>'
);
html = html.replace(/href="style2\./g, 'href="../style2.');
html = html.replace(
  /href="\.\.\/assets\/local-cdn/g,
  'href="../assets/local-cdn'
);

html = html.replace(
  /<body class="[^"]*">/,
  '<body class="designtemplate207 motif0 show_logo resp seo-seiten expats-page versicherungs-check-page">'
);
html = html.replace(
  /href="#seo-landing-content">direkt zum Seiteninhalt/,
  'href="#seo-landing-content">Skip to page content'
);
html = html.replace(
  /<main class="versicherungs-check-main" aria-label="Versicherungs-Check">/,
  '<main class="versicherungs-check-main" aria-label="Insurance Check">'
);

// Relative paths for ENG folder
const linkMap = {
  'internationale_krankenversicherung': 'international_health_insurances',
  'krankenversicherungen': 'health_insurance',
  'krankenversicherung_fuer_freelancer_im_ausland':
    'health_insurance_for_freelancers_abroad',
  'krankenversicherung_fuer_digitale_nomaden':
    'health_insurance_for_digital_nomads',
  'dia_reiseversicherungen': 'expat_travel_insurance',
  'privathaftpflichtversicherung': 'private_liability_insurance',
  'haftpflicht': 'liability_insurances',
  'unfallversicherung': 'private_accident_insurance',
  'dia_altersvorsorge_im_ausland': 'retirement_planning_in_other_countries',
  'wer_wir_sind': 'who_we_are',
  'kontaktformular': 'contact_form',
  'versicherungsschutz_fuer_familienmitglieder':
    'family_protection_for_family_members',
  'faq_downloads_in_mehreren_sprachen': 'faq_downloads',
  'impressum-1241326': 'impressum',
  'datenschutz-0-p11': 'privacy',
  'beschwerden-1241326-p4': 'complaints',
  'index.html': '/ENG/',
  'assets/whatsapplogo.png': '../assets/whatsapplogo.png',
  'main.7a280948f1e2.js': '../main.js',
  'ENG/insurance-check': 'insurance-check',
  'versicherungs-check': '../versicherungs-check',
};

// Wizard + UI strings
const tr = [
  ['Fortschrittsanzeige', 'Progress indicator'],
  ['Schritt 1 von 4', 'Step 1 of 4'],
  ['Schritt 2 von 4', 'Step 2 of 4'],
  ['Schritt 3 von 4', 'Step 3 of 4'],
  ['Schritt 4 von 4', 'Step 4 of 4'],
  ['Wo bist du aktuell / wo willst du hin?', 'Where are you now / where are you heading?'],
  [
    'Die wichtigste Einstiegsfrage – sie entscheidet 70&nbsp;% der Versicherungslogik.',
    'The most important starting question – it determines 70&nbsp;% of the insurance logic.',
  ],
  ['Deutschland → Ausland', 'Germany → abroad'],
  ['Ich lebe in Deutschland und gehe ins Ausland', 'I live in Germany and am going abroad'],
  ['Bereits im Ausland', 'Already abroad'],
  ['Ich lebe bereits im Ausland', 'I already live abroad'],
  ['Komme nach Deutschland', 'Coming to Germany'],
  ['Ich komme nach Deutschland', 'I am coming to Germany'],
  ['Temporär / Reise', 'Temporary / travel'],
  [
    'Ich bin nur temporär unterwegs (Reise / Weltreise)',
    'I am only temporarily abroad (trip / round-the-world travel)',
  ],
  ['Weiter <span aria-hidden="true">→</span>', 'Continue <span aria-hidden="true">→</span>'],
  ['Was beschreibt deine Situation am besten?', 'What best describes your situation?'],
  [
    'Beeinflusst Krankenversicherung, Absicherung und Beratungstiefe.',
    'Affects health insurance, coverage and depth of advice.',
  ],
  ['Angestellt', 'Employed'],
  ['Selbstständig / Freelancer', 'Self-employed / freelancer'],
  ['Digital Nomad', 'Digital nomad'],
  ['Student / Au Pair', 'Student / au pair'],
  ['Familie', 'Family'],
  ['← Zurück', '← Back'],
  ['Wie lange bleibst du im Ausland / in der Situation?', 'How long will you stay abroad / in this situation?'],
  [
    'Absolut entscheidend für die Tarifwahl: Reiseversicherung vs. echte Auslandslösung.',
    'Crucial for choosing a plan: travel insurance vs. a real international solution.',
  ],
  ['Unter 6 Monate', 'Under 6 months'],
  ['6–24 Monate', '6–24 months'],
  ['Dauerhaft / unklar', 'Permanent / unclear'],
  ['Was ist dir wichtiger?', 'What matters more to you?'],
  ['Deine Priorität entscheidet über unsere Empfehlung.', 'Your priority drives our recommendation.'],
  ['Schnell &amp; günstig', 'Fast &amp; affordable'],
  ['Schnell &amp; günstig abschließen', 'Sign up quickly &amp; affordably'],
  ['Beste Absicherung', 'Best coverage'],
  ['Beste Absicherung finden', 'Find the best coverage'],
  ['Ich bin unsicher → Beratung', 'I am unsure → advice'],
  ['Ergebnis anzeigen <span aria-hidden="true">→</span>', 'Show result <span aria-hidden="true">→</span>'],
  [
    'Versicherungs-Check: Welche Versicherung passt wirklich zu dir?',
    'Insurance Check: Which insurance really fits you?',
  ],
  [
    'Ob Expat, Digital Nomad, Ausländer in Deutschland oder Ausgewanderte – der richtige Versicherungsschutz hängt von deiner konkreten Lebenssituation ab. In 4 kurzen Schritten zeigt dir unser Versicherungs-Check, welcher Tarif zu dir passt.',
    'Whether you are an expat, digital nomad, foreigner in Germany or emigrant – the right insurance depends on your specific situation. In 4 short steps, our Insurance Check shows which plan fits you.',
  ],
  ['Inhaltsverzeichnis', 'Table of contents'],
  ['Auf dieser Seite', 'On this page'],
  ['Warum ein Versicherungs-Check?', 'Why an Insurance Check?'],
  ['Auslandskrankenversicherung', 'International health insurance'],
  ['Reiseversicherung', 'Travel insurance'],
  ['Privathaftpflichtversicherung', 'Private liability insurance'],
  ['Unfallversicherung', 'Accident insurance'],
  ['Altersvorsorge im Ausland', 'Retirement planning abroad'],
  ['Unsere Versicherungspartner', 'Our insurance partners'],
  ['Häufige Fragen', 'Frequently asked questions'],
  ['Warum ein persönlicher Versicherungs-Check?', 'Why a personal Insurance Check?'],
  [
    'Kein Expat, kein Ausländer in Deutschland und kein digitaler Nomade hat dieselbe Situation. Standardprodukte aus dem deutschen Markt passen oft nicht – weder für Menschen, die Deutschland verlassen, noch für Zugewanderte, die hier vorübergehend leben. Der Versicherungs-Check auf dieser Seite ermittelt anhand von vier gezielten Fragen, welche Art von Absicherung wirklich zu deinem Profil passt.',
    'No expat, foreigner in Germany or digital nomad has the same situation. Standard products from the German market often do not fit – neither for people leaving Germany nor for newcomers living here temporarily. This Insurance Check uses four targeted questions to find what coverage really matches your profile.',
  ],
  [
    'Entscheidend sind dabei vor allem drei Faktoren: <strong>dein Wohnort</strong> (Deutschland oder Ausland), <strong>deine berufliche Situation</strong> (angestellt, selbstständig, Student) und <strong>die Dauer deines Aufenthalts</strong>. Wer zum Beispiel unter sechs Monate im Ausland ist, braucht eine andere Lösung als jemand, der dauerhaft auswandert.',
    'Three factors matter most: <strong>where you live</strong> (Germany or abroad), <strong>your work situation</strong> (employed, self-employed, student) and <strong>how long you stay</strong>. For example, under six months abroad needs a different solution than permanent relocation.',
  ],
  ['Schritt 1', 'Step 1'],
  ['Schritt 2', 'Step 2'],
  ['Schritt 3', 'Step 3'],
  ['Schritt 4', 'Step 4'],
  ['Wo bist du?', 'Where are you?'],
  [
    'Deutschland → Ausland, bereits im Ausland, Zuzug nach Deutschland oder temporäre Reise – die Ausgangssituation bestimmt 70&nbsp;% der Versicherungslogik.',
    'Germany → abroad, already abroad, moving to Germany or temporary travel – your starting point determines 70&nbsp;% of the insurance logic.',
  ],
  ['Wer bist du?', 'Who are you?'],
  [
    'Angestellt, selbstständig, Freelancer, Digital Nomad, Student, Au Pair oder Familie – jede Situation bringt andere Versicherungslücken mit sich.',
    'Employed, self-employed, freelancer, digital nomad, student, au pair or family – each situation has different insurance gaps.',
  ],
  ['Wie lange?', 'How long?'],
  [
    'Unter 6 Monate, 6–24 Monate oder dauerhaft – der Zeitraum entscheidet zwischen einer Reiseversicherung und einer echten Auslandslösung.',
    'Under 6 months, 6–24 months or permanent – duration decides between travel insurance and a real international solution.',
  ],
  ['Was ist wichtiger?', 'What matters more?'],
  [
    'Schnell &amp; günstig abschließen, maximale Absicherung oder persönliche Beratung – deine Priorität steuert unsere konkrete Empfehlung.',
    'Signing up quickly and cheaply, maximum coverage or personal advice – your priority drives our recommendation.',
  ],
  [
    'Auslandskrankenversicherung – der wichtigste Schutz',
    'International health insurance – the most important cover',
  ],
  [
    'Die <a href="international_health_insurances">internationale Krankenversicherung</a> ist für die meisten Expats und Ausgewanderten die wichtigste Police überhaupt. Im Ausland gibt es in der Regel keinen gesetzlichen Krankenschutz – wer ohne Versicherung behandelt wird, riskiert fünf- bis sechsstellige Rechnungen.',
    'The <a href="international_health_insurances">international health insurance</a> is the most important policy for most expats and emigrants. Abroad there is usually no statutory health cover – treatment without insurance can mean five- or six-figure bills.',
  ],
  ['Für Ausländer in Deutschland', 'For foreigners in Germany'],
  [
    'Wer nach Deutschland einreist und hier lebt oder arbeitet, benötigt einen gültigen Krankenversicherungsnachweis. Für Nicht-EU-Bürger ist die gesetzliche Pflichtversicherung oft nicht sofort zugänglich – spezielle <a href="krankenversicherungen">Krankenversicherungen für Ausländer in Deutschland</a> überbrücken diese Lücke. Sie werden akzeptiert für Visaanträge, Behörden und Arbeitgeber.',
    'Anyone moving to Germany to live or work needs valid health insurance proof. For non-EU citizens, statutory cover is often not immediately available – special <a href="health_insurance">health insurance for foreigners in Germany</a> bridges that gap. They are accepted for visa applications, authorities and employers.',
  ],
  ['Für Deutsche und Expats im Ausland', 'For Germans and expats abroad'],
  [
    'Wer Deutschland verlässt und dauerhaft oder langfristig im Ausland lebt, sollte sich frühzeitig mit einer <a href="internationale_krankenversicherung">internationalen Krankenversicherung</a> absichern. Diese deckt im Gegensatz zu einer normalen Reisekrankenversicherung auch chronische Erkrankungen, Mutterschaft, Zahnarzt und Routinebehandlungen ab – und das weltweit oder in einer definierten Region.',
    'Anyone leaving Germany to live abroad long term should secure <a href="international_health_insurances">international health insurance</a> early. Unlike travel health insurance, it also covers chronic conditions, maternity, dental and routine care – worldwide or in a defined region.',
  ],
  [
    '„Wer länger unterwegs ist, benötigt eine Langzeit-Auslandskrankenversicherung.“',
    '“Anyone travelling longer needs long-term international health insurance.”',
  ],
  ['Besondere Zielgruppen', 'Specific target groups'],
  [
    'Für <a href="krankenversicherung_fuer_freelancer_im_ausland">Freelancer im Ausland</a> gelten besondere Anforderungen: Sie haben keinen Arbeitgeber, der Beiträge mitträgt, und müssen sich vollständig selbst versichern. <a href="krankenversicherung_fuer_digitale_nomaden">Digitale Nomaden</a> benötigen Tarife, die in mehreren Ländern gleichzeitig gelten und auch bei häufigem Länderwechsel stabil bleiben.',
    '<a href="health_insurance_for_freelancers_abroad">Freelancers abroad</a> face special requirements: no employer shares contributions, so you must insure yourself fully. <a href="health_insurance_for_digital_nomads">Digital nomads</a> need plans valid in several countries and stable when changing countries often.',
  ],
  [
    'Reiseversicherung – für kurze Aufenthalte und Weltreisen',
    'Travel insurance – for short stays and round-the-world trips',
  ],
  [
    'Wer für weniger als sechs Monate ins Ausland reist, kommt oft mit einer <a href="expat_travel_insurance">Reiseversicherung</a> aus. Diese ist günstiger als eine vollwertige Auslandskrankenversicherung und deckt die häufigsten Risiken ab: Krankheit, Unfall, Gepäckverlust, Reiserücktritt und Reiseabbruch.',
    'If you travel abroad for less than six months, a <a href="expat_travel_insurance">travel insurance</a> policy is often enough. It is cheaper than full international health insurance and covers common risks: illness, accident, lost luggage, trip cancellation and interruption.',
  ],
  [
    'Wichtig zu wissen: Eine klassische deutsche Reisekrankenversicherung ist meist auf 42 bis 56 Tage pro Reise begrenzt. Für Weltreisen oder längere Aufenthalte empfehlen sich spezielle Langzeitreise-Policen. Der Versicherungs-Check zeigt dir auf Basis deiner Aufenthaltsdauer automatisch, welche Lösung für dich geeignet ist.',
    'Note: A classic German travel health policy is usually limited to 42–56 days per trip. For round-the-world or longer stays, special long-term travel policies are recommended. The Insurance Check automatically shows which solution fits your duration.',
  ],
  [
    'Privathaftpflichtversicherung im Ausland',
    'Private liability insurance abroad',
  ],
  [
    'Die Privathaftpflichtversicherung ist in Deutschland eine der meistgenutzten Versicherungen – und das aus gutem Grund. Sie schützt, wenn du versehentlich einem anderen Schaden zufügst: ein zerkratztes Auto, ein gebrochenes Handgelenk des Nachbarn, ein beschädigtes Mietobjekt.',
    'Private liability insurance is one of the most common policies in Germany – for good reason. It covers accidental harm to others: a scratched car, a neighbour’s injury, damage to a rental property.',
  ],
  [
    'Für <a href="private_liability_insurance">Ausländer in Deutschland</a> ist eine Haftpflichtversicherung zwar nicht gesetzlich vorgeschrieben, aber in der Praxis unverzichtbar – Vermieter fordern sie häufig als Bedingung für den Mietvertrag. Für <a href="liability_insurances">Deutsche im Ausland</a> stellt sich die Frage, ob die bestehende deutsche Police im Zielland weiter gilt.',
    'For <a href="private_liability_insurance">foreigners in Germany</a>, liability insurance is not legally required but practically essential – landlords often require it. For <a href="liability_insurances">Germans abroad</a>, the question is whether your German policy still applies in the destination country.',
  ],
  [
    'Unfallversicherung – weltweit und rund um die Uhr',
    'Accident insurance – worldwide, 24/7',
  ],
  [
    'Die gesetzliche Unfallversicherung in Deutschland deckt nur Arbeitsunfälle und Wegeunfälle ab – Freizeitunfälle sind nicht enthalten. Eine private <a href="private_accident_insurance">Unfallversicherung</a> schließt diese Lücke und zahlt bei dauerhafter Invalidität als Folge eines Unfalls, unabhängig davon, wo du dich auf der Welt befindest.',
    'Statutory accident insurance in Germany only covers work and commuting accidents – not leisure. Private <a href="private_accident_insurance">accident insurance</a> fills that gap and pays for permanent disability after an accident, wherever you are in the world.',
  ],
  [
    'Für Expats und Menschen, die viel reisen oder Sport treiben, ist die weltweite 24-Stunden-Deckung besonders wichtig. Die Leistungen umfassen in der Regel: Invaliditätsentschädigung, Todesfall-Leistung, Unfalltagesgeld und Übernahme von Heilbehandlungskosten.',
    'For expats and frequent travellers or athletes, worldwide 24-hour cover is especially important. Benefits usually include disability compensation, death benefit, daily accident allowance and treatment costs.',
  ],
  [
    'Altersvorsorge im Ausland – frühzeitig planen',
    'Retirement planning abroad – plan early',
  ],
  [
    'Wer als Expat oder Auswanderer dauerhaft im Ausland lebt, verliert häufig Ansprüche in der deutschen gesetzlichen Rentenversicherung. <a href="retirement_planning_in_other_countries">Altersvorsorge im Ausland</a> ist deshalb ein Thema, das viele zu spät angehen.',
    'Expats and emigrants living abroad permanently often lose entitlements in German statutory pension insurance. <a href="retirement_planning_in_other_countries">Retirement planning abroad</a> is something many address too late.',
  ],
  [
    'Je nach Zielland und Aufenthaltsstatus kommen unterschiedliche Instrumente infrage: freiwillige Einzahlungen in die deutsche Rentenversicherung, international anerkannte Fondspolicen oder fondsgebundene Kapitalversicherungen mit flexiblem Zugriff. Unser Versicherungs-Check identifiziert, ob und wann das Thema für dich relevant wird.',
    'Depending on destination and residence status, options include voluntary German pension contributions, internationally recognised fund policies or unit-linked policies with flexible access. Our Insurance Check flags when this topic is relevant for you.',
  ],
  ['Unsere Versicherungspartner im Überblick', 'Our insurance partners at a glance'],
  [
    'Als unabhängiger Versicherungsmakler arbeitet <a href="who_we_are">Spreefinanz</a> mit mehreren spezialisierten Anbietern zusammen, die für Expats und internationale Versicherungslösungen bekannt sind. Je nach deinem Profil empfehlen wir den passenden Anbieter – kein Einheitsprodukt, sondern individuelle Beratung.',
    'As an independent broker, <a href="who_we_are">Spreefinanz</a> works with several specialists known for expat and international insurance. We recommend the right provider for your profile – not a one-size-fits-all product, but individual advice.',
  ],
  ['Für Ausländer in Deutschland', 'For foreigners in Germany'],
  [
    'spezialisiert auf internationale Expat-Krankenversicherungen mit flexiblen Laufzeiten',
    'specialised in international expat health insurance with flexible terms',
  ],
  [
    'Marktführer für Auslandskrankenversicherungen im deutschsprachigen Raum',
    'market leader for international health insurance in German-speaking countries',
  ],
  [
    'günstige Einsteigerlösungen für Studenten, Au Pairs und Sprachschüler',
    'affordable entry plans for students, au pairs and language students',
  ],
  [
    'global operierender Gesundheitsversicherer mit Premium-Netzwerk',
    'global health insurer with premium network',
  ],
  ['flexible Tarife für Kurzzeit- und Langzeitaufenthalte', 'flexible plans for short and long stays'],
  [
    'luxemburgischer Spezialversicherer mit starkem Europa-Fokus',
    'Luxembourg-based specialist with strong Europe focus',
  ],
  ['Für Deutsche und Expats im Ausland', 'For Germans and expats abroad'],
  [
    'einer der wenigen deutschen Versicherer mit weltweiter Expat-Krankenversicherung',
    'one of few German insurers with worldwide expat health insurance',
  ],
  [
    'preisgünstige Tarife für Deutsche, die ins Ausland ziehen',
    'affordable plans for Germans moving abroad',
  ],
  [
    'internationales Spitzennetz für anspruchsvolle Expats',
    'international top network for demanding expats',
  ],
  ['bewährt für Digital Nomads und Freelancer weltweit', 'proven for digital nomads and freelancers worldwide'],
  [
    'starke Lösung für Entsandte und dauerhaft Ausgewanderte',
    'strong solution for assignees and permanent emigrants',
  ],
  [
    'besonders für Europa-Expats und Ruheständler im Ausland geeignet',
    'especially for Europe expats and retirees abroad',
  ],
  [
    'modular buchbar, ideal für flexible Lebensmodelle',
    'modular, ideal for flexible lifestyles',
  ],
  [
    '„Als unabhängiger Makler sind wir keinem Anbieter verpflichtet – wir finden die Lösung, die zu deiner Situation passt, nicht die mit der höchsten Provision.“',
    '“As an independent broker we are not tied to any provider – we find the solution that fits your situation, not the one with the highest commission.”',
  ],
  ['— Mission, Spreefinanz / spreefinanz.de', '— Mission, Spreefinanz / spreefinanz.de'],
  ['Häufige Fragen zum Versicherungs-Check', 'Frequently asked questions about the Insurance Check'],
  [
    'Kurz und verständlich: die wichtigsten Antworten zu Kosten, Zielgruppen und nächsten Schritten nach dem Check.',
    'Short and clear: key answers on cost, target groups and next steps after the check.',
  ],
  ['Ist der Versicherungs-Check kostenlos und unverbindlich?', 'Is the Insurance Check free and non-binding?'],
  [
    'Ja, vollständig. Der Check dient der Orientierung und verpflichtet dich zu nichts. Im Anschluss kannst du eine kostenlose <a href="https://calendly.com/sebastian-spreefinanz/30min" target="_blank" rel="noopener">Online-Beratung buchen</a> oder direkt eine <a href="contact_form">Anfrage stellen</a>.',
    'Yes, completely. The check is for orientation only. Afterwards you can book a free <a href="https://calendly.com/sebastian-spreefinanz/30min" target="_blank" rel="noopener">online consultation</a> or <a href="contact_form">send an enquiry</a>.',
  ],
  [
    'Welche Versicherung brauche ich als Ausländer, der nach Deutschland kommt?',
    'What insurance do I need as a foreigner coming to Germany?',
  ],
  [
    'In der Regel eine Krankenversicherung, die für Visaanträge und Behörden in Deutschland anerkannt wird. Wir empfehlen je nach Aufenthaltszweck und -dauer Tarife von <a href="care_concept">Care Concept</a>, <a href="april">April</a> oder <a href="bdae">BDAE</a>. Ergänzend ist eine <a href="private_liability_insurance">Privathaftpflichtversicherung</a> für den Alltag sinnvoll.',
    'Usually health insurance recognised for visa applications and authorities in Germany. We recommend plans from <a href="care_concept">Care Concept</a>, <a href="april">April</a> or <a href="bdae">BDAE</a> depending on purpose and duration. <a href="private_liability_insurance">Private liability insurance</a> is also sensible for daily life.',
  ],
  [
    'Ich bin selbstständig und lebe im Ausland – was brauche ich?',
    'I am self-employed and live abroad – what do I need?',
  ],
  [
    'Als <a href="krankenversicherung_fuer_freelancer_im_ausland">Freelancer im Ausland</a> musst du dich vollständig selbst versichern. Eine internationale Krankenversicherung ist Pflicht – zusätzlich empfehlen sich Haftpflicht, ggf. eine Berufsunfähigkeitsversicherung und ein Plan für die Altersvorsorge.',
    'As a <a href="health_insurance_for_freelancers_abroad">freelancer abroad</a> you must insure yourself fully. International health insurance is essential – we also recommend liability, possibly occupational disability cover and retirement planning.',
  ],
  [
    'Gilt meine deutsche Krankenversicherung noch, wenn ich auswandere?',
    'Does my German health insurance still apply if I emigrate?',
  ],
  [
    'Nein. Wer sich dauerhaft aus Deutschland abmeldet und keinen Wohnsitz mehr in Deutschland hat, verliert den Anspruch auf gesetzliche Krankenversicherung. Auch private Krankenversicherungen sind häufig an den deutschen Wohnsitz geknüpft. Eine <a href="international_health_insurances">internationale Krankenversicherung</a> muss rechtzeitig vor der Abmeldung abgeschlossen werden.',
    'No. If you deregister permanently and no longer reside in Germany, you lose statutory health insurance. Private German policies are often tied to residence in Germany. <a href="international_health_insurances">International health insurance</a> should be arranged before deregistration.',
  ],
  [
    'Was bedeutet „Familie absichern“ im internationalen Kontext?',
    'What does “protecting family” mean in an international context?',
  ],
  [
    'Für <a href="family_protection_for_family_members">Familienmitglieder im Ausland</a> gibt es spezielle Policen, die Eltern, Partner und Kinder gemeinsam absichern – oft zu günstigeren Konditionen als mehrere Einzeltarife. Der Check erkennt automatisch, wenn Familienschutz für dich relevant ist.',
    'For <a href="family_protection_for_family_members">family members abroad</a> there are policies covering parents, partners and children together – often cheaper than several individual plans. The check flags when family cover is relevant for you.',
  ],
  [
    'Kann ich auch auf Deutsch und Englisch beraten werden?',
    'Can I get advice in German and English?',
  ],
  [
    'Ja. Die Beratung bei Spreefinanz ist auf Deutsch und Englisch möglich – die <a href="https://zoom.us/j/7319679053" target="_blank" rel="noopener">Videoberatung mit Sprachauswahl</a> ist direkt buchbar. Außerdem gibt es <a href="faq_downloads">FAQ und Downloads in mehreren Sprachen</a>.',
    'Yes. Spreefinanz advice is available in German and English – <a href="https://zoom.us/j/7319679053" target="_blank" rel="noopener">video consultation with language choice</a> can be booked directly. There are also <a href="faq_downloads">FAQs and downloads in several languages</a>.',
  ],
  ['Noch unsicher? Lass dich kostenlos beraten.', 'Still unsure? Get free advice.'],
  [
    'Sebastian Krüger von Spreefinanz berät dich auf Deutsch oder Englisch – per Video, Telefon oder Chat.',
    'Sebastian Krüger at Spreefinanz advises you in German or English – by video, phone or chat.',
  ],
  ['Termin buchen', 'Book appointment'],
  ['Schließen', 'Close'],
  ['Deine Empfehlung', 'Your recommendation'],
  ['Das passt am besten zu deinen Angaben.', 'This best matches your answers.'],
  ['Deine Antworten', 'Your answers'],
  [
    'Bei weiteren Fragen gerne <a href="contact_form">Anfrage senden</a>.',
    'For further questions, please <a href="contact_form">send an enquiry</a>.',
  ],
  ['Zum LinkedIn-Profil', 'LinkedIn profile'],
  ['Zum Youtube-Profil', 'YouTube profile'],
  ['Impressum', 'Imprint'],
  ['Datenschutz', 'Privacy'],
  ['Erstinformation', 'Initial information'],
  ['Beschwerden', 'Complaints'],
  ['Cookies', 'Cookies'],
  [
    'Diese Website verwendet Cookies. Einige Cookies sind für den Betrieb der Website unbedingt erforderlich. Andere Cookies sind optional und erweitern den Funktionsumfang (u. a. Google Analytics und LinkedIn Insight Tag für Statistik und Marketing). Sie können Ihre Einwilligung jederzeit widerrufen. Nähere Informationen finden Sie in der <a class="dselink" href="privacy.html#dse_cookies">Datenschutzerklärung</a>.',
    'This website uses cookies. Some cookies are essential for the site to work. Others are optional and extend functionality (including Google Analytics and LinkedIn Insight Tag for statistics and marketing). You can withdraw consent at any time. See the <a class="dselink" href="privacy.html#dse_cookies">privacy policy</a> for details.',
  ],
  ['alle Cookies erlauben', 'allow all cookies'],
  ['nur notwendige Cookies', 'essential cookies only'],
  ['weitere Einstellungen', 'more settings'],
  ['Persoenliche Beratung', 'Personal consultation'],
  ['Beratung buchen', 'Book consultation'],
  ['Direkt zur Versicherung', 'Go to insurance'],
  ['Zum Kalender', 'Open calendar'],
  ['Mehr Informationen', 'More information'],
  ['Route', 'Route'],
  ['Profil', 'Profile'],
  ['Dauer', 'Duration'],
  ['Fokus', 'Priority'],
  ['Kontakt via WhatsApp', 'Contact via WhatsApp'],
  ['WhatsApp schreiben', 'Message on WhatsApp'],
];

// Longest German strings first so partial replacements (e.g. "Auslandskrankenversicherung") do not break longer phrases.
const trSorted = [...tr].sort((a, b) => b[0].length - a[0].length);
for (const [de, en] of trSorted) {
  html = html.split(de).join(en);
}

for (const [from, to] of Object.entries(linkMap)) {
  html = html.split(`href="${from}"`).join(`href="${to}"`);
}

// Modal + footer imprint paths already mapped; fix script scroll like DE
html = html.replace(
  /window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);/,
  `var wizardEl = document.querySelector('.wizard-viewport') || document.querySelector('.wizard-page-wrap');
        if (wizardEl) {
            wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }`
);

// Remove duplicate scroll if script already has wizard scroll from DE template
if (html.includes('wizardEl.scrollIntoView') && html.match(/wizardEl\.scrollIntoView/g)?.length > 1) {
  html = html.replace(
    /var wizardEl = document\.querySelector\('\.wizard-viewport'\)[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\}/,
    `var wizardEl = document.querySelector('.wizard-viewport') || document.querySelector('.wizard-page-wrap');
        if (wizardEl) {
            wizardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }`
  );
}

// WhatsApp EN text
html = html.replace(
  /text=Hey%20Sebastian%21%20Ich%20h%C3%A4tte%20ein%20paar%20Fragen%20zu%20meiner%20Situation%2C%20k%C3%B6nntest%20du%20mir%20weiterhelfen%3F/,
  'text=Hey%20Sebastian%21%20I%20have%20a%20few%20questions%20about%20my%20situation%2C%20could%20you%20help%3F'
);

// Provider logos path
html = html.replace(/logo: '\.\.\/assets/g, "logo: '../assets");

// TOC aria
html = html.replace('aria-label="Inhaltsverzeichnis"', 'aria-label="Table of contents"');

fs.writeFileSync(outPath, html, 'utf8');
console.log('Wrote', outPath, '(' + html.split('\n').length + ' lines)');
