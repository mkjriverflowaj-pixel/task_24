import type { Schema, Struct } from '@strapi/strapi';

export interface AnimationAboutMotion extends Struct.ComponentSchema {
  collectionName: 'components_animation_about_motions';
  info: {
    displayName: 'About page motion';
  };
  attributes: {
    productSliderAutoplay: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    productSliderSeconds: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 30;
          min: 1.5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<3.8>;
    valuesAutoplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    valuesSeconds: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 30;
          min: 1.5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
  };
}

export interface AnimationHomeMotion extends Struct.ComponentSchema {
  collectionName: 'components_animation_home_motions';
  info: {
    displayName: 'Home page motion';
  };
  attributes: {
    clickSparks: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heroSliderAutoplay: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    heroSliderSeconds: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 30;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    marqueeSeconds: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 120;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<22>;
    orbitAutoplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    orbitSeconds: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 30;
          min: 1.5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    orbitTurnSeconds: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 0.6;
        },
        number
      > &
      Schema.Attribute.DefaultTo<2.3>;
    preloader: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    testimonialsSeconds: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 240;
          min: 10;
        },
        number
      > &
      Schema.Attribute.DefaultTo<60>;
  };
}

export interface AnimationSmartlinkMotion extends Struct.ComponentSchema {
  collectionName: 'components_animation_smartlink_motions';
  info: {
    displayName: 'Smart Link page motion';
  };
  attributes: {
    heroLottie: Schema.Attribute.Media<'files'>;
    heroStory: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    heroTilt: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    qrEffect: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    qrSeconds: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5.3>;
  };
}

export interface SharedAddress extends Struct.ComponentSchema {
  collectionName: 'components_shared_addresss';
  info: {
    displayName: 'Address';
  };
  attributes: {
    label: Schema.Attribute.String;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedCapability extends Struct.ComponentSchema {
  collectionName: 'components_shared_capabilities';
  info: {
    displayName: 'Capability';
  };
  attributes: {
    bullets: Schema.Attribute.Text;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Enumeration<
      ['factory', 'shield', 'box', 'gear', 'flask', 'chip', 'headset', 'user']
    > &
      Schema.Attribute.DefaultTo<'factory'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCertification extends Struct.ComponentSchema {
  collectionName: 'components_shared_certifications';
  info: {
    displayName: 'Certification';
  };
  attributes: {
    fullName: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedDetail extends Struct.ComponentSchema {
  collectionName: 'components_shared_details';
  info: {
    displayName: 'Detail Row';
  };
  attributes: {
    asList: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.Text;
  };
}

export interface SharedFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_features';
  info: {
    displayName: 'Feature';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_shared_hero_slides';
  info: {
    displayName: 'Hero Slide';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    buttonUrl: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    subheading: Schema.Attribute.String;
    theme: Schema.Attribute.Enumeration<['red', 'black', 'warm']> &
      Schema.Attribute.DefaultTo<'red'>;
  };
}

export interface SharedLeader extends Struct.ComponentSchema {
  collectionName: 'components_shared_leaders';
  info: {
    displayName: 'Leader';
  };
  attributes: {
    badge: Schema.Attribute.String;
    icon: Schema.Attribute.Enumeration<
      ['user', 'shield', 'headset', 'chip', 'gear', 'factory', 'box', 'flask']
    > &
      Schema.Attribute.DefaultTo<'user'>;
    role: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.Text;
    unit: Schema.Attribute.String;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMilestone extends Struct.ComponentSchema {
  collectionName: 'components_shared_milestones';
  info: {
    displayName: 'Milestone';
  };
  attributes: {
    current: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    year: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedRangeItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_range_items';
  info: {
    displayName: 'Range Item';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    link: Schema.Attribute.String;
  };
}

export interface SharedShowcaseSlide extends Struct.ComponentSchema {
  collectionName: 'components_shared_showcase_slides';
  info: {
    displayName: 'Showcase Slide';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface SharedSpaceCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_space_cards';
  info: {
    displayName: 'Space Card';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String;
    tag: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSpec extends Struct.ComponentSchema {
  collectionName: 'components_shared_specs';
  info: {
    displayName: 'Specification';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'Stat';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    suffix: Schema.Attribute.String;
    unit: Schema.Attribute.String;
    value: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface SharedValueItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_value_items';
  info: {
    displayName: 'Value Item';
  };
  attributes: {
    art: Schema.Attribute.Enumeration<
      ['promise', 'quality', 'safety', 'care', 'india']
    > &
      Schema.Attribute.DefaultTo<'promise'>;
    image: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'animation.about-motion': AnimationAboutMotion;
      'animation.home-motion': AnimationHomeMotion;
      'animation.smartlink-motion': AnimationSmartlinkMotion;
      'shared.address': SharedAddress;
      'shared.capability': SharedCapability;
      'shared.certification': SharedCertification;
      'shared.detail': SharedDetail;
      'shared.feature': SharedFeature;
      'shared.hero-slide': SharedHeroSlide;
      'shared.leader': SharedLeader;
      'shared.link': SharedLink;
      'shared.milestone': SharedMilestone;
      'shared.range-item': SharedRangeItem;
      'shared.showcase-slide': SharedShowcaseSlide;
      'shared.space-card': SharedSpaceCard;
      'shared.spec': SharedSpec;
      'shared.stat': SharedStat;
      'shared.value-item': SharedValueItem;
    }
  }
}
