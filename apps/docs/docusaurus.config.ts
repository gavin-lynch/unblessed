import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";
import browserPolyfillsPlugin from "./plugins/browser-polyfills/index.ts";

const GITHUB_OWNER = "gavin-lynch";
const GITHUB_REPO = "unblessed";
const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
const DOCS_URL = "https://unblessed-docs.vercel.app";

const config: Config = {
  title: "unblessed",
  tagline: "Modern, platform-agnostic terminal UI library",
  favicon: "img/favicon.svg",

  url: DOCS_URL,
  baseUrl: "/",

  // Metadata for SEO
  headTags: [
    // Open Graph / Facebook
    {
      tagName: "meta",
      attributes: {
        property: "og:type",
        content: "website",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:site_name",
        content: "unblessed",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:image",
        content: `${DOCS_URL}/img/social-card.png`,
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:image:width",
        content: "1200",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:image:height",
        content: "630",
      },
    },
    // Twitter Card
    {
      tagName: "meta",
      attributes: {
        name: "twitter:card",
        content: "summary_large_image",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "twitter:image",
        content: `${DOCS_URL}/img/social-card.png`,
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "twitter:creator",
        content: "@gavin-lynch",
      },
    },
    // Additional SEO
    {
      tagName: "meta",
      attributes: {
        name: "description",
        content:
          "Modern, platform-agnostic terminal UI library for Node.js and browsers. TypeScript-first, 100% blessed-compatible, with cross-platform support.",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "keywords",
        content:
          "terminal, TUI, CLI, terminal UI, blessed, Node.js, TypeScript, browser, XTerm.js, command line, console, text interface",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "canonical",
        href: DOCS_URL,
      },
    },
  ],

  future: {
    v4: true,
    experimental_faster: true,
  },

  organizationName: GITHUB_OWNER,
  projectName: "unblessed",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    // Node polyfills + stubs for @unblessed/browser in the LiveDemo client bundle
    browserPolyfillsPlugin,

    // Image zoom on click
    "docusaurus-plugin-image-zoom",

    // PWA - offline documentation
    [
      "@docusaurus/plugin-pwa",
      {
        debug: false,
        offlineModeActivationStrategies: [
          "appInstalled",
          "standalone",
          "queryString",
        ],
        pwaHead: [
          {
            tagName: "link",
            rel: "icon",
            href: "/img/logo.svg",
          },
          {
            tagName: "link",
            rel: "manifest",
            href: "/manifest.json",
          },
          {
            tagName: "meta",
            name: "theme-color",
            content: "#0dbc79",
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-capable",
            content: "yes",
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-status-bar-style",
            content: "black-translucent",
          },
        ],
      },
    ],

    // Google Analytics
    [
      "@docusaurus/plugin-google-gtag",
      {
        trackingID: "G-00NB4J6PPG",
        anonymizeIP: true,
      },
    ],
  ],

  themes: ["@docusaurus/theme-mermaid"],

  markdown: {
    mermaid: true,
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: `${GITHUB_URL}/tree/main/apps/docs/`,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          editUrl: `${GITHUB_URL}/tree/main/apps/docs/`,
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "unblessed",
      logo: {
        alt: "unblessed Logo",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: GITHUB_URL,
          label: "GitHub",
          position: "right",
        },
        {
          href: "https://www.npmjs.com/package/@unblessed/core",
          label: "npm",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Introduction",
              to: "/docs/getting-started/introduction",
            },
            {
              label: "Quick Start",
              to: "/docs/getting-started/quick-start",
            },
            {
              label: "Migration from blessed",
              to: "/docs/getting-started/migration-from-blessed",
            },
            {
              label: "FAQ",
              to: "/docs/faq",
            },
          ],
        },
        {
          title: "Guides",
          items: [
            {
              label: "API Reference",
              to: "/docs/api/generated/widgets.screen.Class.Screen",
            },
            {
              label: "Testing Guide",
              to: "/docs/advanced/testing",
            },
            {
              label: "Examples",
              to: "/docs/examples/getting-started/simple-box",
            },
            {
              label: "Troubleshooting",
              to: "/docs/advanced/troubleshooting",
            },
          ],
        },
        {
          title: "Packages",
          items: [
            {
              label: "@unblessed/node",
              href: "https://www.npmjs.com/package/@unblessed/node",
            },
            {
              label: "@unblessed/browser",
              href: "https://www.npmjs.com/package/@unblessed/browser",
            },
            {
              label: "@unblessed/blessed",
              href: "https://www.npmjs.com/package/@unblessed/blessed",
            },
            {
              label: "@unblessed/vrt",
              href: "https://www.npmjs.com/package/@unblessed/vrt",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: GITHUB_URL,
            },
            {
              label: "Discussions",
              href: `${GITHUB_URL}/discussions`,
            },
            {
              label: "Issues",
              href: `${GITHUB_URL}/issues`,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Gavin Brady Lynch. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ["typescript", "javascript", "bash", "json"],
    },
    algolia: {
      appId: "I4NDKPVBEY",
      apiKey: "a71ca6a825a6a05f3b135d9612b23bd8",
      indexName: "Unblessed Docs",
      contextualSearch: true,
      searchParameters: {},
    },
    // Image zoom configuration
    zoom: {
      selector: ".markdown :not(em) > img",
      background: {
        light: "rgba(255, 255, 255, 0.9)",
        dark: "rgba(30, 30, 30, 0.9)",
      },
      config: {
        // Zoom config options
      },
    },
    // Mermaid configuration
    mermaid: {
      theme: { light: "neutral", dark: "dark" },
      options: {
        maxTextSize: 50000,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
