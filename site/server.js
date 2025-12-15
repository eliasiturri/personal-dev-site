const express = require('express');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');
const nodemailer = require("nodemailer");
const { marked } = require('marked');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DEFAULT_LANGUAGE = 'en';
const MAX_DB_HITS = process.env.MAX_DB_HITS || 15;

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        backend: {
            loadPath: path.resolve(__dirname, 'locales/{{lng}}/{{ns}}.json')
        },
        detection: {
            order: ['path', 'cookie'],
        },
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: ['en', 'es', 'se'],
        preload: ['en', 'se', 'es']
    });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const app = express();
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json());        // Parse JSON bodies (as sent by API clients)
app.set('view engine', 'ejs');  // set the view engine to ejs
app.use(i18nextMiddleware.handle(i18next));

// Make marked available to EJS templates
app.locals.marked = marked;

var db = require('./database/database.js');

// Initialize tables (fire and forget). These run asynchronously but are safe with IF NOT EXISTS.
db.prepare('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, subject TEXT, text TEXT, site_lang TEXT, ip TEXT, ts TEXT);').run().catch(console.error);
db.prepare('CREATE TABLE IF NOT EXISTS db_hits (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, ts TEXT);').run().catch(console.error);

app.use('/assets', express.static(path.join(__dirname, "assets")));
app.use('/presentation', express.static(path.join(__dirname, "presentation")));


app.get('/:lng?/posts', (req, res) => {
    let lang = req.language || DEFAULT_LANGUAGE;
    i18next.changeLanguage(lang);
    res.render('pages/posts', { language: lang });
});

app.get('/:lng?/presentation/:project', (req, res) => {
    let lang = req.language || DEFAULT_LANGUAGE;
    let project = req.params['project'];
    i18next.changeLanguage(lang);
    res.render('pages/presentation', { language: lang, project: project });
});

// Allow rendering only known post templates to avoid path traversal/LFI
// Slugs can be configured via env VALID_POST_SLUGS (comma-separated, e.g. "gardenbot,chatconnect").
// If not provided, they are auto-detected from views/pages/posts/*.ejs at startup.
const POST_TEMPLATES_DIR = path.join(__dirname, 'views', 'pages', 'posts');
function buildValidPostSlugs() {
    const fromEnv = process.env.VALID_POST_SLUGS;
    if (fromEnv && typeof fromEnv === 'string') {
        return new Set(
            fromEnv
                .split(',')
                .map(s => s.trim())
                .filter(s => /^[a-z0-9-]+$/.test(s))
        );
    }
    try {
        const files = fs.readdirSync(POST_TEMPLATES_DIR);
        return new Set(
            files
                .filter(f => f.endsWith('.ejs'))
                .map(f => f.replace(/\.ejs$/,'').trim())
                .filter(s => /^[a-z0-9-]+$/.test(s))
        );
    } catch (e) {
        // If directory read fails, fall back to an empty set (no posts allowed)
        return new Set();
    }
}
const VALID_POST_SLUGS = buildValidPostSlugs();

app.get('/:lng?/posts/:slug', (req, res) => {
    // get the post slug that comes from :post-slug
    const postSlug = String(req.params['slug'] || '');
    // Clamp language to supported set
    const lang = (['en', 'es', 'se'].includes(req.language)) ? req.language : DEFAULT_LANGUAGE;
    i18next.changeLanguage(lang);

    if (VALID_POST_SLUGS.has(postSlug)) {
        res.render('pages/posts/' + postSlug, { language: lang });
    } else {
        // Unknown slug, render listing or 404
        res.status(404).render('pages/posts', { language: lang });
    }
});


app.get('/:lng?/credits', (req, res) => {
    let lang = req.language || DEFAULT_LANGUAGE;
    i18next.changeLanguage(lang);
    res.render('pages/credits', { language: lang });
});

app.post('/:lng?/contact', async (req, res) => {
    let lang = req.language || DEFAULT_LANGUAGE;
    // get the sender IP address
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let oneHourAgoTs = Date.now() - 3600000;

    // await 1.5 seconds to simulate a slow server
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        // get the number of hits from the database for that IP in the last hour
        let row = await db.prepare('SELECT COUNT(*) as hits FROM db_hits WHERE ip = ? AND ts > ?;').get(ip, oneHourAgoTs);
        let hits = (row && row.hits) ? row.hits : 0;
        console.log("hits: " + hits);
        if (hits >= MAX_DB_HITS) {
            res.status(429).send({ok: false, message: i18next.t('contact.tooManyRequests', { lng: lang })});

            try {
                let nodemailerResult = await transporter.sendMail({
                    from: 'personal .dev site security',
                    to: process.env.CONTACT_EMAIL,
                    subject: 'too many db_hits from one IP in the last hour',
                    text: `The IP ${ip} has reached ${hits} hits in the last hour.`
                });
            } catch (error) {
                console.log(error);
            }

            return;
        }
    await db.prepare('INSERT INTO db_hits (ip, ts) VALUES (?, ?);').run(ip, Date.now());

    } catch (error) {
        console.log(error)
    }

    try {
       
        let name = req.body.name || '';
        let email = req.body.email || '';
        let subject = req.body.subject || '';
        let text = req.body.text || '';
        let ts = new Date().toISOString();

        // Sanitize inputs to prevent email header injection
        // Remove any newline characters that could be used to inject additional headers
        const sanitize = (str) => String(str).replace(/[\r\n]/g, '').trim();
        name = sanitize(name).substring(0, 100);
        email = sanitize(email).substring(0, 254); // Max email length per RFC
        subject = sanitize(subject).substring(0, 200);
        // Text can contain newlines, but limit to prevent abuse
        text = String(text).trim().substring(0, 5000);

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            res.status(400).send({ok: false, message: i18next.t('contact.invalidEmail', { lng: lang }) || 'Invalid email address'});
            return;
        }
    
    await db.prepare('INSERT INTO messages (name, email, subject, text, site_lang, ip, ts) VALUES (?, ?, ?, ?, ?, ?, ?);').run(name, email, subject, text, lang, ip, ts);
    
        try {

            let nodemailerResult = await transporter.sendMail({
                from: process.env.FROM_EMAIL,
                replyTo: email ? `${name} <${email}>` : undefined,
                to: process.env.CONTACT_EMAIL,
                subject: `[Contact Form] ${subject}`,
                text: `${text}\n\n-----\nMessage sent by "${name}" with response e-mail address "${email}" and site language "${lang}".`
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({ok: true, message: i18next.t('contact.fwdError', { lng: lang })});
            return;
        }
    
        res.status(200).send({ok: true, message: i18next.t('contact.success', { lng: lang })});
    } catch (error) {
        console.log(error)
        res.status(500).send({mok: false, message: i18next.t('contact.error', { lng: lang })});
    }

});

app.get('/:lng?', (req, res) => {
    let lang = req.language || DEFAULT_LANGUAGE;
    i18next.changeLanguage(lang);
    res.render('pages/index', { language: lang });
});

const PROTOCOL = process.env.PROTOCOL || "http";
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PROTOCOL}://${HOST}:${PORT}`);
});