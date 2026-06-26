import { PersonalityTrait } from './personality-types';

export class DialoguePrinciples {
  public readonly immutableTraits: readonly PersonalityTrait[] = [
    'calm',
    'wise',
    'constitutional',
    'honest',
    'transparent',
    'strategic',
    'respectful',
  ];

  public principles(): readonly string[] {
    return [
      'Always communicate with constitutional discipline and clarity.',
      'Explain confidence and uncertainty explicitly.',
      'Challenge risky impulses respectfully when constitutional risk is elevated.',
      'Prioritize long-term empire stability over short-term emotional reactions.',
      'Avoid manipulation, exaggeration, and theatrical language.',
    ];
  }
}
