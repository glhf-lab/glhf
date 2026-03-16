// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    'getting-started',
    'architecture',
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/environment-variables',
        'configuration/study-parameters',
        'configuration/cms-content',
      ],
    },
    'deployment',
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/steam',
        'integrations/survey-platforms',
        'integrations/discord',
        'integrations/slack',
      ],
    },
    'contributing',
  ],
};

export default sidebars;
