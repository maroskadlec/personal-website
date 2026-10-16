/* How to reach and hire: one source for the Terminal's `hire`, the 2008 Contact page, the Links window
   and the vCard that File > Save Contact As… saves. */
import { profile } from './profile.js';
import { links } from './links.js';

export const contact = {
    status: 'open',
    offers: 'product redesigns · design systems · AI-assisted front-end · consulting',
    response: '<24h',
    email: profile.email,
    jobTitle: 'Senior Product Designer',               // the same title the 2008 page's kicker gives
    site: 'https://mariankadlec.cz'                  // the real address (the CNAME of the repository); build.mjs --check keeps index.html in step
};

/** the contact as a vCard 3.0 (what an address book imports); one line per field, CRLF as the format asks */
export function vcard() {
    const v = (s) => String(s).replace(/([,;\\])/g, '\\$1');
    const [first, ...rest] = profile.name.split(' ');
    const last = rest.join(' ');
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${v(last)};${v(first)};;;`,
        `FN:${v(profile.name)}`,
        `TITLE:${v(contact.jobTitle)}`,
        `EMAIL;TYPE=INTERNET:${contact.email}`,
        `ADR;TYPE=WORK:;;;Prague;;;Czech Republic`,
        `URL:${contact.site}`,
        ...links.filter((l) => l.key !== 'market').map((l) => `URL:${l.url}`),
        `NOTE:${v(profile.title)}`,
        'END:VCARD'
    ];
    return lines.join('\r\n') + '\r\n';
}
