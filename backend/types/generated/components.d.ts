import type { Attribute, Schema } from '@strapi/strapi';

export interface DiscordConnectedFail extends Schema.Component {
  collectionName: 'components_discord_connected_fails';
  info: {
    displayName: 'Connected Fail';
    icon: 'thumbs-down';
  };
  attributes: {
    chip: Attribute.String;
    description: Attribute.Text;
    title: Attribute.String;
  };
}

export interface DiscordConnectedSuccess extends Schema.Component {
  collectionName: 'components_discord_connected_successes';
  info: {
    description: '';
    displayName: 'Connected Success';
    icon: 'thumbs-up';
  };
  attributes: {
    chip: Attribute.String;
    description: Attribute.Text;
    title: Attribute.String;
  };
}

export interface DiscordNotConnected extends Schema.Component {
  collectionName: 'components_discord_not_connecteds';
  info: {
    description: '';
    displayName: 'Not Connected';
    icon: 'angry';
  };
  attributes: {
    buttonLabelNotConnected: Attribute.String;
    descriptionNotConnected: Attribute.Text;
    titleNotConnected: Attribute.String;
  };
}

export interface ElementsAccordionItem extends Schema.Component {
  collectionName: 'components_elements_accordion_items';
  info: {
    description: '';
    displayName: 'Accordion Item';
    icon: 'angle-down';
  };
  attributes: {
    content: Attribute.RichText;
    showTo: Attribute.Enumeration<['everyone', 'public', 'prolific']> &
      Attribute.DefaultTo<'everyone'>;
    title: Attribute.String;
  };
}

export interface ElementsCloseSignUp extends Schema.Component {
  collectionName: 'components_elements_close_sign_ups';
  info: {
    description: '';
    displayName: 'Close sign up';
    icon: 'window-close';
  };
  attributes: {
    description: Attribute.Text;
    maxUsers: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<4000>;
    signUpEnabled: Attribute.Boolean & Attribute.DefaultTo<true>;
  };
}

export interface ElementsFeature extends Schema.Component {
  collectionName: 'components_elements_features';
  info: {
    displayName: 'Feature';
    icon: 'traffic-light';
    name: 'feature';
  };
  attributes: {
    name: Attribute.String;
  };
}

export interface ElementsFeatureColumn extends Schema.Component {
  collectionName: 'components_slices_feature_columns';
  info: {
    description: '';
    displayName: 'Feature column';
    icon: 'align-center';
    name: 'FeatureColumn';
  };
  attributes: {
    description: Attribute.Text;
    icon: Attribute.Media<'images'> & Attribute.Required;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ElementsFeatureRow extends Schema.Component {
  collectionName: 'components_slices_feature_rows';
  info: {
    description: '';
    displayName: 'Feature row';
    icon: 'arrows-alt-h';
    name: 'FeatureRow';
  };
  attributes: {
    description: Attribute.Text;
    link: Attribute.Component<'links.link'>;
    media: Attribute.Media<'images' | 'videos'> & Attribute.Required;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ElementsFooterSection extends Schema.Component {
  collectionName: 'components_links_footer_sections';
  info: {
    displayName: 'Footer section';
    icon: 'chevron-circle-down';
    name: 'FooterSection';
  };
  attributes: {
    links: Attribute.Component<'links.link', true>;
    title: Attribute.String;
  };
}

export interface ElementsLogo extends Schema.Component {
  collectionName: 'components_elements_sitelogo';
  info: {
    description: '';
    displayName: 'Site logo';
    icon: 'picture';
  };
  attributes: {
    logoImg: Attribute.Media<'images'>;
    textBottom: Attribute.String;
    textTop: Attribute.String;
  };
}

export interface ElementsLogos extends Schema.Component {
  collectionName: 'components_elements_logos';
  info: {
    description: '';
    displayName: 'Logos';
    icon: 'apple-alt';
    name: 'logos';
  };
  attributes: {
    logo: Attribute.Media<'images'> & Attribute.Required;
    title: Attribute.String;
  };
}

export interface ElementsNotificationBanner extends Schema.Component {
  collectionName: 'components_elements_notification_banners';
  info: {
    description: '';
    displayName: 'Notification banner';
    icon: 'exclamation';
    name: 'NotificationBanner';
  };
  attributes: {
    enabled: Attribute.Boolean & Attribute.DefaultTo<false>;
    text: Attribute.RichText;
  };
}

export interface ElementsStudyProgress extends Schema.Component {
  collectionName: 'components_elements_study_progresses';
  info: {
    description: '';
    displayName: 'Study progress';
    icon: 'arrow-alt-circle-right';
  };
  attributes: {
    active: Attribute.RichText;
    activeProlific: Attribute.RichText;
    linkedNotActive: Attribute.RichText;
    notLinked: Attribute.RichText;
    studyCompleted: Attribute.RichText;
    surveySent: Attribute.RichText;
    surveySentProlific: Attribute.RichText;
  };
}

export interface ElementsTeamMember extends Schema.Component {
  collectionName: 'components_elements_team_members';
  info: {
    description: '';
    displayName: 'Team member';
    icon: 'angry';
  };
  attributes: {
    links: Attribute.Component<'links.icon-link', true>;
    name: Attribute.String & Attribute.Required;
    picture: Attribute.Media<'images'> & Attribute.Required;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ElementsTestimonial extends Schema.Component {
  collectionName: 'components_slices_testimonials';
  info: {
    displayName: 'Testimonial';
    icon: 'user-check';
    name: 'Testimonial';
  };
  attributes: {
    authorName: Attribute.String;
    authorTitle: Attribute.String;
    link: Attribute.String;
    logo: Attribute.Media<'images'>;
    picture: Attribute.Media<'images'>;
    text: Attribute.Text;
  };
}

export interface ElementsUniversity extends Schema.Component {
  collectionName: 'components_elements_universities';
  info: {
    displayName: 'University';
    icon: 'archway';
  };
  attributes: {
    logo: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface IntegrationsDiscord extends Schema.Component {
  collectionName: 'components_integrations_discords';
  info: {
    description: '';
    displayName: 'Discord';
    icon: 'address-book';
  };
  attributes: {
    connectedFail: Attribute.Component<'discord.connected-fail'>;
    connectedSuccess: Attribute.Component<'discord.connected-success'>;
    notConnected: Attribute.Component<'discord.not-connected'>;
    show: Attribute.Boolean;
  };
}

export interface IntegrationsIntegrations extends Schema.Component {
  collectionName: 'components_integrations_integrations';
  info: {
    displayName: 'Integrations';
    icon: 'angle-down';
  };
  attributes: {};
}

export interface IntegrationsSteam extends Schema.Component {
  collectionName: 'components_integrations_steams';
  info: {
    description: '';
    displayName: 'Steam';
    icon: 'address-book';
  };
  attributes: {
    connectedFail: Attribute.Component<'steam.connected-fail'>;
    connectedSuccess: Attribute.Component<'steam.connected-success'>;
    notConnected: Attribute.Component<'steam.not-connected'>;
    show: Attribute.Boolean;
  };
}

export interface LayoutFooter extends Schema.Component {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
    icon: 'caret-square-down';
    name: 'Footer';
  };
  attributes: {
    columns: Attribute.Component<'elements.footer-section', true>;
    smallText: Attribute.String;
  };
}

export interface LayoutNavbar extends Schema.Component {
  collectionName: 'components_layout_navbars';
  info: {
    description: '';
    displayName: 'Navbar';
    icon: 'map-signs';
    name: 'Navbar';
  };
  attributes: {
    button: Attribute.Component<'links.button-link'>;
    links: Attribute.Component<'links.link', true>;
    logo: Attribute.Component<'elements.logo'>;
  };
}

export interface LinksButton extends Schema.Component {
  collectionName: 'components_links_simple_buttons';
  info: {
    description: '';
    displayName: 'Button';
    icon: 'fingerprint';
    name: 'Button';
  };
  attributes: {
    text: Attribute.String;
    type: Attribute.Enumeration<['primary', 'secondary']>;
  };
}

export interface LinksButtonLink extends Schema.Component {
  collectionName: 'components_links_buttons';
  info: {
    description: '';
    displayName: 'Button link';
    icon: 'fingerprint';
    name: 'Button-link';
  };
  attributes: {
    newTab: Attribute.Boolean & Attribute.DefaultTo<false>;
    text: Attribute.String;
    type: Attribute.Enumeration<['primary', 'secondary']>;
    url: Attribute.String;
  };
}

export interface LinksIconLink extends Schema.Component {
  collectionName: 'components_links_icon_links';
  info: {
    displayName: 'Icon link';
    icon: 'link';
  };
  attributes: {
    icon: Attribute.Enumeration<['github', 'twitter', 'mastodon', 'website']>;
    url: Attribute.String & Attribute.Required;
  };
}

export interface LinksLink extends Schema.Component {
  collectionName: 'components_links_links';
  info: {
    description: '';
    displayName: 'Link';
    icon: 'link';
    name: 'Link';
  };
  attributes: {
    newTab: Attribute.Boolean & Attribute.DefaultTo<false>;
    text: Attribute.String & Attribute.Required;
    url: Attribute.String & Attribute.Required;
  };
}

export interface MetaMetadata extends Schema.Component {
  collectionName: 'components_meta_metadata';
  info: {
    description: '';
    displayName: 'Metadata';
    icon: 'robot';
    name: 'Metadata';
  };
  attributes: {
    metaDescription: Attribute.Text & Attribute.Required;
    metaTitle: Attribute.String;
    shareImage: Attribute.Media<'images'>;
    twitterCardType: Attribute.Enumeration<
      ['summary', 'summary_large_image', 'app', 'player']
    > &
      Attribute.DefaultTo<'summary'>;
    twitterUsername: Attribute.String;
  };
}

export interface ProfileAccountData extends Schema.Component {
  collectionName: 'components_profile_account_data';
  info: {
    description: '';
    displayName: 'Account data';
    icon: 'user';
  };
  attributes: {
    deleteDataButtonLabel: Attribute.String;
    deleteDataDescription: Attribute.RichText;
    deleteDataHeader: Attribute.String;
    deleteDataModal: Attribute.RichText;
    deleteDataModalButtonCancelLabel: Attribute.String;
    deleteDataModalButtonDeleteLabel: Attribute.String;
    deleteDataModalHeader: Attribute.String;
    header: Attribute.String;
    withdrawButtonLabel: Attribute.String;
    withdrawDescription: Attribute.RichText;
    withdrawHeader: Attribute.String;
  };
}

export interface ProfileFeedback extends Schema.Component {
  collectionName: 'components_profile_feedbacks';
  info: {
    description: '';
    displayName: 'Feedback';
    icon: 'hourglass-start';
  };
  attributes: {
    active: Attribute.RichText;
    linkedNotActive: Attribute.RichText;
    notLinked: Attribute.RichText;
    progress: Attribute.Component<'profile.progress'>;
    provider: Attribute.Enumeration<['prolific', 'public', 'qualtrics']>;
    studyCompleted: Attribute.RichText;
    surveySent: Attribute.RichText;
  };
}

export interface ProfileProgress extends Schema.Component {
  collectionName: 'components_profile_progresses';
  info: {
    displayName: 'progress';
    icon: 'arrowRight';
  };
  attributes: {
    checkPrivacyStepCompletedLabel: Attribute.RichText;
    checkPrivacyStepNotCompletedLabel: Attribute.RichText;
    linkStepCompletedLabel: Attribute.RichText;
    linkStepNotCompletedLabel: Attribute.RichText;
    showCheckPrivacyStep: Attribute.Boolean;
    showLinkStep: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
    showStudyCompletedStep: Attribute.Boolean;
    showSurveyStep: Attribute.Boolean;
    studyCompletedLabel: Attribute.RichText;
    surveyStepCompletedLabel: Attribute.RichText;
    surveyStepNotCompletedLabel: Attribute.RichText;
  };
}

export interface SectionsAccordion extends Schema.Component {
  collectionName: 'components_sections_accordions';
  info: {
    description: '';
    displayName: 'Accordion';
    icon: 'question';
  };
  attributes: {
    accordionItems: Attribute.Component<'elements.accordion-item', true>;
    title: Attribute.String;
  };
}

export interface SectionsBottomActions extends Schema.Component {
  collectionName: 'components_slices_bottom_actions';
  info: {
    displayName: 'Bottom actions';
    icon: 'angle-double-right';
    name: 'BottomActions';
  };
  attributes: {
    buttons: Attribute.Component<'links.button-link', true>;
    title: Attribute.String;
  };
}

export interface SectionsFeatureColumnsGroup extends Schema.Component {
  collectionName: 'components_slices_feature_columns_groups';
  info: {
    displayName: 'Feature columns group';
    icon: 'star-of-life';
    name: 'FeatureColumnsGroup';
  };
  attributes: {
    features: Attribute.Component<'elements.feature-column', true>;
  };
}

export interface SectionsFeatureRowsGroup extends Schema.Component {
  collectionName: 'components_slices_feature_rows_groups';
  info: {
    displayName: 'Feaures row group';
    icon: 'bars';
    name: 'FeatureRowsGroup';
  };
  attributes: {
    features: Attribute.Component<'elements.feature-row', true>;
  };
}

export interface SectionsHero extends Schema.Component {
  collectionName: 'components_slices_heroes';
  info: {
    description: '';
    displayName: 'Hero';
    icon: 'heading';
    name: 'Hero';
  };
  attributes: {
    buttons: Attribute.Component<'links.button-link', true>;
    description: Attribute.Text;
    label: Attribute.String;
    picture: Attribute.Media<'images'>;
    pictureCredit: Attribute.Text;
    smallTextWithLink: Attribute.Text;
    title: Attribute.String;
  };
}

export interface SectionsLargeVideo extends Schema.Component {
  collectionName: 'components_slices_large_videos';
  info: {
    displayName: 'Large video';
    icon: 'play-circle';
    name: 'LargeVideo';
  };
  attributes: {
    description: Attribute.String;
    poster: Attribute.Media<'images'>;
    title: Attribute.String;
    video: Attribute.Media<'videos'> & Attribute.Required;
  };
}

export interface SectionsLeadForm extends Schema.Component {
  collectionName: 'components_sections_lead_forms';
  info: {
    description: '';
    displayName: 'Lead form';
    icon: 'at';
    name: 'Lead form';
  };
  attributes: {
    emailPlaceholder: Attribute.String;
    location: Attribute.String;
    submitButton: Attribute.Component<'links.button'>;
    title: Attribute.String;
  };
}

export interface SectionsLogos extends Schema.Component {
  collectionName: 'components_sections_logos';
  info: {
    description: '';
    displayName: 'Logos';
    icon: 'archway';
  };
  attributes: {
    description: Attribute.Text;
    logos: Attribute.Component<'elements.logos', true>;
    title: Attribute.String;
  };
}

export interface SectionsRichText extends Schema.Component {
  collectionName: 'components_sections_rich_texts';
  info: {
    displayName: 'Rich text';
    icon: 'text-height';
    name: 'RichText';
  };
  attributes: {
    content: Attribute.RichText;
  };
}

export interface SectionsTeam extends Schema.Component {
  collectionName: 'components_sections_teams';
  info: {
    description: '';
    displayName: 'Team';
    icon: 'address-card';
  };
  attributes: {
    description: Attribute.Text;
    teamMember: Attribute.Component<'elements.team-member', true>;
    title: Attribute.String;
  };
}

export interface SteamConnectedFail extends Schema.Component {
  collectionName: 'components_steam_connected_fails';
  info: {
    description: '';
    displayName: 'Connected Fail';
    icon: 'thumbs-down';
  };
  attributes: {
    buttonLabelRecheck: Attribute.String;
    chip: Attribute.String;
    description: Attribute.Text;
    feedbackFoundOwnedGames: Attribute.String;
    feedbackFoundRecentlyPlayedGames: Attribute.String;
    feedbackHasPlaytimePrivate: Attribute.String;
    feedbackHasPlaytimePublic: Attribute.String;
    feedbackNoOwnedGames: Attribute.String;
    feedbackNoRecentlyPlayedGames: Attribute.String;
    title: Attribute.String;
  };
}

export interface SteamConnectedSuccess extends Schema.Component {
  collectionName: 'components_steam_connected_successes';
  info: {
    description: '';
    displayName: 'Connected Success';
    icon: 'thumbs-up';
  };
  attributes: {
    chip: Attribute.String;
    description: Attribute.Text;
    title: Attribute.String;
  };
}

export interface SteamNotConnected extends Schema.Component {
  collectionName: 'components_steam_not_connecteds';
  info: {
    description: '';
    displayName: 'Not Connected';
    icon: 'angry';
  };
  attributes: {
    buttonLabelNotConnected: Attribute.String;
    descriptionNotConnected: Attribute.Text;
    titleNotConnected: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'discord.connected-fail': DiscordConnectedFail;
      'discord.connected-success': DiscordConnectedSuccess;
      'discord.not-connected': DiscordNotConnected;
      'elements.accordion-item': ElementsAccordionItem;
      'elements.close-sign-up': ElementsCloseSignUp;
      'elements.feature': ElementsFeature;
      'elements.feature-column': ElementsFeatureColumn;
      'elements.feature-row': ElementsFeatureRow;
      'elements.footer-section': ElementsFooterSection;
      'elements.logo': ElementsLogo;
      'elements.logos': ElementsLogos;
      'elements.notification-banner': ElementsNotificationBanner;
      'elements.study-progress': ElementsStudyProgress;
      'elements.team-member': ElementsTeamMember;
      'elements.testimonial': ElementsTestimonial;
      'elements.university': ElementsUniversity;
      'integrations.discord': IntegrationsDiscord;
      'integrations.integrations': IntegrationsIntegrations;
      'integrations.steam': IntegrationsSteam;
      'layout.footer': LayoutFooter;
      'layout.navbar': LayoutNavbar;
      'links.button': LinksButton;
      'links.button-link': LinksButtonLink;
      'links.icon-link': LinksIconLink;
      'links.link': LinksLink;
      'meta.metadata': MetaMetadata;
      'profile.account-data': ProfileAccountData;
      'profile.feedback': ProfileFeedback;
      'profile.progress': ProfileProgress;
      'sections.accordion': SectionsAccordion;
      'sections.bottom-actions': SectionsBottomActions;
      'sections.feature-columns-group': SectionsFeatureColumnsGroup;
      'sections.feature-rows-group': SectionsFeatureRowsGroup;
      'sections.hero': SectionsHero;
      'sections.large-video': SectionsLargeVideo;
      'sections.lead-form': SectionsLeadForm;
      'sections.logos': SectionsLogos;
      'sections.rich-text': SectionsRichText;
      'sections.team': SectionsTeam;
      'steam.connected-fail': SteamConnectedFail;
      'steam.connected-success': SteamConnectedSuccess;
      'steam.not-connected': SteamNotConnected;
    }
  }
}
