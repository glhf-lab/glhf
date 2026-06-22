// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Game Log Harvesting Framework',
  tagline: 'GLHF - open-source data donation for gameplay research',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://glhf-lab.github.io',
  baseUrl: '/glhf/',

  organizationName: 'glhf-lab',
  projectName: 'glhf',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/glhf-lab/glhf/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Game Log Harvesting Framework',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://glhf-lab.github.io/glhf/demo/',
            label: 'Live Demo',
            position: 'right',
          },
          {
            href: 'https://github.com/glhf-lab/glhf',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Live Demo',
                href: 'https://glhf-lab.github.io/glhf/demo/',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/glhf-lab/glhf',
              },
            ],
          },
        ],
        copyright: `MIT License — Game Log Harvesting Framework. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json'],
      },
      mermaid: {
        theme: { light: 'default', dark: 'dark' },
      },
    }),
};

export default config;
