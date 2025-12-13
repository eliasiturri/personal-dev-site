# Personal Developer Portfolio Site

A multilingual, static, personal portfolio website built with Node.js, Express, Glider.js, and EJS templates. Fully responsive across mobile, tablet, and desktop. Features a contact form with rate limiting, blog posts, project showcase, presentations via reveal.js, and i18n support.

You can find a live version [here](https://eliasiturri.dev).

## Features

- 🌍 **Multilingual Support** - English, Spanish, and Swedish translations
- 📧 **Contact Form** - With email notifications via SMTP
- 🛡️ **Rate Limiting** - IP-based protection against spam
- 🎨 **Responsive Design** - Works on all devices
- 🐳 **Docker Support** - Easy deployment with Docker Compose
- 🔒 **SSL Ready** - Includes Certbot for Let's Encrypt certificates

## Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose (for containerized deployment)
- SMTP server credentials (for contact form functionality) (optional; in case the message can't be forwarded, the visitor will be informed and the message stored in the database)

## Getting Started

### 1. Clone the Repository

```bash
git clone <this-repo-url>
cd personal-dev-site
```

### 2. Create and Configure Environment Variables

**Important:** You must create a `.env` file from the template before running the application.

Copy the example environment file and configure it with your settings:

```bash
cd site
cp .env.example .env
```

Edit the newly created `.env` file and fill in your configuration.

### 3. Initialize the Database

Don't worry about this, during the first run, the `db.sqlite3` database will be initialized with the required tables.

### 4. Install Dependencies

Run this from the `site` directory:

```bash
cd site
npm install
```

### 5. Run the Application

#### Option A: Run Locally (development)

From the `site` directory:

```bash
node server.js
```

The site will be available at the defined location.

#### Option B: Run with Docker

From the `docker` directory:

```bash
cd docker
docker compose up -d
```

The site will be available at the defined location.

## Project Structure

```
personal-dev-site/
├── docker/                       # Docker configuration
│   ├── docker-compose.yml        # Docker Compose setup
│   ├── Dockerfile                # Application container
│   ├── nginx.conf                # Nginx reverse proxy config
│   └── README.md
│
├── site/                         # Application code
│   ├── .env                      # Runtime environment (not committed)
│   ├── .env.example              # Environment template
│   ├── assets/                   # Static assets
│   │   ├── css/                  # Stylesheets (main.css, form.css, etc.)
│   │   ├── js/                   # Client scripts (form.js, blog-toc.js, etc.)
│   │   │   └── libs/             # Vendor libs (SlimSelect, etc.)
│   │   └── images/               # Images, favicons, backgrounds
│   ├── database/
│   │   └── database.js           # sql.js wrapper and persistence
│   ├── db.sqlite3                # SQLite database (created at runtime)
│   ├── locales/                  # i18n translation files (en, es, se)
│   │   ├── en/translation.json
│   │   ├── es/translation.json
│   │   └── se/translation.json
│   ├── presentation/             # Presentations and assets
│   │   ├── *.html                 # Presentation files (per language)
│   │   ├── images/                # Images used by presentations
│   │   ├── slides/                # Static slide assets (if exported)
│   │   └── videos/                # Videos used by presentations
│   ├── views/                    # EJS templates
│   │   ├── pages/                # Pages (index, posts, credits, presentation)
│   │   │   └── posts/            # Individual post templates
│   │   └── partials/             # Header, footer, form, etc.
│   ├── package.json              # Dependencies and scripts
│   ├── package-lock.json         # Locked dependency tree
│   └── server.js                 # Main Express application
│
└── README.md                     # This file
```

## Configuration

### SMTP Setup

The contact form requires SMTP credentials to send emails. Popular options:

- **SendGrid**: Free tier available
- **Mailgun**: Free tier available
- **Amazon SES**: Pay-as-you-go pricing

### Rate Limiting

The application tracks contact form submissions by IP address to prevent spam. Configure `MAX_DB_HITS` in your `.env` file to set the maximum requests per IP per hour (default: 15).

### Blog Post Slugs (allowlist vs auto-detect)

To prevent template path traversal, the server only renders blog posts whose slugs are explicitly allowed. You have two ways to control this list:

1) Configure via environment (recommended for production)

Add a comma-separated list to `site/.env`:

```env
VALID_POST_SLUGS=gardenbot,chatconnect,smarthome,budgettracker,fontalike
```

2) Auto-detect from templates (default)

If `VALID_POST_SLUGS` is not set, the server will automatically discover slugs by scanning `site/views/pages/posts/*.ejs` and using the file basenames as allowed slugs.

Notes:
- Only slugs matching `^[a-z0-9-]+$` are considered valid.
- If you add or rename a post template, the auto-detection will pick it up on server restart. With the env-based allowlist, update the variable accordingly.

## Customization

### Adding Content

1. **Projects**: Edit the project showcase in `site/views/partials/projects.ejs`
2. **Translations**: Update files in `site/locales/{en,es,se}/translation.json`
3. **Styling**: Modify CSS files in `site/assets/css/`
4. **Images**: Add images to `site/assets/images/`

### Supported Languages

- English (en)
- Spanish (es)
- Swedish (se)

Add more languages by:
1. Creating a new folder in `site/locales/`
2. Adding the language code to `supportedLngs` in `server.js`

## Content Management

This section explains how to add and manage content in the i18n translation files.

### Understanding Posts vs. Fullposts

The application uses two related structures for blog posts:

#### 1. **posts** (Array)
Located in `site/locales/{lang}/translation.json` as a top-level array.

```json
"posts": [
  {
    "title": "Blog Post Title",
    "intro": "A short preview of the post content...",
    "date": "January 15, 2024",
    "link": "/posts/post-slug"
  }
]
```

**Purpose**: Used on the blog listing page (`/posts`). Shows post previews in a grid or list format.

**Fields**:
- `title`: Post heading displayed in the listing
- `intro`: Short description/preview text
- `date`: Publication date (display format)
- `link`: Relative URL to the full post (e.g., `/posts/post-slug`)

#### 2. **fullposts** (Object)
Located in `site/locales/{lang}/translation.json` as a top-level object.

```json
"fullposts": {
  "post-slug": {
    "title": "Blog Post Title",
    "intro": "A short preview...",
    "author": "Author Name",
    "dateNexus": "by",
    "date": "January 15, 2024",
    "toc": [
      { "name": "Introduction" },
      { "name": "Main Content" },
      { "name": "Conclusion" }
    ]
  }
}
```

**Purpose**: Used on individual blog post detail pages (e.g., `/posts/post-slug`). Contains full content and metadata.

**Fields**:
- `title`: Post title
- `intro`: Post introduction/subtitle
- `author`: Author name
- `dateNexus`: Connector word between author and date (e.g., "by")
- `date`: Publication date
- `toc`: Array of table of contents items (section headings)

**Important**: You must create a corresponding EJS view file at `site/views/pages/posts/post-slug.ejs` for each post. See existing examples in that directory.

### Adding Projects

Projects are defined in the `projects` array in each translation file:

```json
"projects": [
  {
    "title": "Project Name",
    "intro": "Short description of the project",
    "tags": [
      { "name": "JavaScript", "style": "solid" },
      { "name": "React", "style": "border" }
    ],
    "image": "assets/images/projects/project-image.jpg",
    "link": "/posts/project-details"
  }
]
```

**Fields**:
- `title`: Project name
- `intro`: Brief description (1-2 sentences)
- `tags`: Array of technology/category tags
- `image`: Path to project thumbnail (relative to site root)
- `link`: URL to detailed blog post or external link
- `preview_image`: Optional array of one or more image paths used for the fullscreen quick preview overlay.
- `preview_descriptions`: Optional array of caption strings (same length as `preview_image`). Shown below each image in the overlay.

**Tag Styles**:
- `"solid"`: Filled background (e.g., primary technologies)
- `"border"`: Outlined style (e.g., secondary tools/frameworks)

### Quick Preview Overlay

If a project entry includes a `preview_image` array (and optionally `preview_descriptions`), a small corner icon will appear on its card. Clicking it opens a fullscreen overlay showing those images and captions. Example (English translation file excerpt):

```json
{
  "title": "Portfolio Website Template",
  "image_url": "/assets/images/projects/dev-site-white.svg",
  "tags": [ { "name": "Software", "style": "solid" } ],
  "preview_image": ["/assets/images/quick-preview/dev-site.png"],
  "preview_descriptions": ["Fullscreen preview: minimal multilingual portfolio site with blog posts, contact form, project showcase & reveal.js presentations."]
}
```

Notes:
- Provide absolute paths beginning with `/assets/...` for consistency.
- Captions are optional; omit `preview_descriptions` if not needed.
- Supports up to 4 images with layout optimizations in CSS for 1, 2, 3 (balanced grid), or 4 (2x2) previews.
- Add translations in each language file for both images and captions (image paths usually remain the same; captions localize).

### Creating Presentations (reveal.js)

The site supports language-specific presentations using reveal.js. Each presentation is a standalone HTML file loaded dynamically into the generic presentation page template.

#### File Naming Convention

Place presentation files in `site/presentation/` using the pattern:

```
<project>_<lang>.html
```

Examples:

```
portfolio_en.html
portfolio_es.html
portfolio_se.html
```

When a user visits `/presentation/portfolio` (or `/es/presentation/portfolio`, `/se/presentation/portfolio`), the server renders `views/pages/presentation.ejs`, which fetches and injects `/presentation/portfolio_<language>.html`.

#### Minimal Template Example

Below is a minimal presentation file (`site/presentation/portfolio_en.html`) structure. Only the `<div class="reveal"><div class="slides">...</div></div>` descendant slide `<section>` elements are extracted and injected; inline `<style>` blocks are also copied.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    .slide-title { font-size: 2.8rem; color: #fff; }
    .slide-body { font-size: 1.3rem; color: #ddd; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h2 class="slide-title">Welcome</h2>
        <p class="slide-body">Multilingual developer portfolio.</p>
      </section>
      <section>
        <h2 class="slide-title">Features</h2>
        <ul class="slide-body">
          <li>Blog posts</li>
          <li>Contact form (rate limited)</li>
          <li>Project previews</li>
          <li>Quick preview overlay</li>
        </ul>
      </section>
      <section>
        <h2 class="slide-title">Thanks</h2>
        <p class="slide-body">Explore the source on GitHub.</p>
      </section>
    </div>
  </div>
</body>
</html>
```

You do NOT need to include the reveal.js core CSS or JS in each presentation file; the outer template (`presentation.ejs`) already loads reset.css, reveal.css, and the core script plus initialization. If your file contains a script that calls `Reveal.initialize(...)`, it will override the default initialization.

#### Assets (Images / Slides / Videos)

Organize optional media under:

- `site/presentation/images/` for presentation-specific images
- `site/presentation/slides/` for exported slide images (if you pre-render decks)
- `site/presentation/videos/` for embedded video snippets

Reference them in your slide sections with absolute paths like `/presentation/images/your-image.png`. Keep file names lowercase and hyphen-separated for portability.

#### Linking a Presentation from a Project Card

Add a link object with `icon: "presentation"` in the project’s translation entry:

```json
{
  "name": "View presentation",
  "icon": "presentation",
  "url": "/presentation/portfolio"
}
```

Do this per language file (`site/locales/{en|es|se}/translation.json`). The route automatically applies the language prefix when visiting `/es/presentation/portfolio` or `/se/presentation/portfolio`.

#### Multi-Language Strategy

Replicate the base HTML file per language, translating only the slide content:

```
project_en.html
project_es.html
project_se.html
```
---

### Adding a New Blog Post

1. **Add to `posts` array** (all languages):
```json
"posts": [
  {
    "title": "My New Post",
    "intro": "A brief preview...",
    "date": "March 1, 2024",
    "link": "/posts/my-new-post"
  }
]
```

2. **Add to `fullposts` object** (all languages):
```json
"fullposts": {
  "my-new-post": {
    "title": "My New Post",
    "intro": "Detailed introduction...",
    "author": "Your Name",
    "dateNexus": "by",
    "date": "March 1, 2024",
    "toc": [
      { "name": "Section 1" },
      { "name": "Section 2" }
    ]
  }
}
```

3. **Create EJS view file**: `site/views/pages/posts/my-new-post.ejs`
   - Copy an existing post file as a template
   - Update references to use `t("fullposts.my-new-post.*")` for internationalized content
   - You can also write custom HTML/content directly in the EJS file if you prefer

4. **Update all language files**: Repeat steps 1-2 for each language in `site/locales/`

**Note**: Blog posts are independent EJS template files. Each post uses a single EJS file that serves all languages - the same template file is rendered for `/en/posts/my-post`, `/es/posts/my-post`, and `/se/posts/my-post`. Use the i18n system (`t("fullposts.slug.*")`) to provide translated content, or write custom HTML directly in the EJS file if the post doesn't need translation.

### Adding Images with Captions to Blog Posts

Blog posts support rows of images with optional captions. Images are defined in the translation files and automatically rendered by the EJS template.

#### Adding Images to a Section

In your translation file (`site/locales/{lang}/translation.json`), add an `images` array to any section:

```json
"fullposts": {
  "my-post": {
    "sections": {
      "introduction": {
        "title": "Introduction",
        "content": "Your text content here...",
        "images": [
          {
            "src": "/assets/images/posts/photo1.jpg",
            "caption": "Description of the first image"
          },
          {
            "src": "/assets/images/posts/photo2.jpg",
            "caption": "Description of the second image"
          }
        ]
      }
    }
  }
}
```

#### Image Row Behavior

- **Responsive Layout**: Images automatically arrange in a flexible row with wrapping on smaller screens
- **Equal Width**: Images in the same row attempt to maintain equal width
- **Minimum Width**: Each image maintains a minimum width of 200px before wrapping
- **Caption Style**: Captions appear below each image in italicized, slightly dimmed text

#### Best Practices

1. **Image Paths**: Use absolute paths starting with `/assets/images/posts/`
2. **Image Count**: 2-3 images per row works best on most screen sizes
3. **Image Dimensions**: Use consistent aspect ratios for images in the same row for better visual alignment
4. **Alt Text**: Captions are automatically used as `alt` attributes for accessibility
5. **File Organization**: Store blog post images in `site/assets/images/posts/`

#### Example in EJS Template

Your EJS template should include this pattern for each section:

```ejs
<h2 id="section-id"><%= t("fullposts.my-post.sections.introduction.title") %></h2>
<p><%= t("fullposts.my-post.sections.introduction.content") %></p>
<% if (t("fullposts.my-post.sections.introduction.images", { returnObjects: true, defaultValue: [] }).length > 0) { %>
    <div class="image-row">
        <% t("fullposts.my-post.sections.introduction.images", { returnObjects: true }).forEach(img => { %>
            <div class="image-row-item">
                <a href="<%= img.src %>" target="_blank" rel="noopener noreferrer">
                    <img src="<%= img.src %>" alt="<%= img.caption %>">
                </a>
                <div class="image-row-caption"><%= img.caption %></div>
            </div>
        <% }); %>
    </div>
<% } %>
```

This pattern is already implemented in the `gardenbot.ejs` template which you can use as a reference.

### About Section

The `about` object contains your personal bio displayed on the homepage:

```json
"about": {
  "greeting": "Hi, I'm",
  "name": "Your Name",
  "jobTitle": "Full Stack Developer",
  "intro": "Your introduction paragraph..."
}
```

Update this in all language files to customize your personal information.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

This means:
- ✅ You can use, modify, and distribute this software
- ✅ You can use it for commercial purposes
- ⚠️ **You must provide attribution to the original author**
- ⚠️ **You must disclose your source code** when you distribute or run the software as a service
- ⚠️ **Modified versions must also be licensed under AGPL-3.0**

Visit https://www.gnu.org/licenses/agpl-3.0.html for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
