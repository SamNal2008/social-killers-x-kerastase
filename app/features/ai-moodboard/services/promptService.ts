import type { TribePromptData } from '../types';

/**
 * Tribe-specific prompt templates for image generation
 * TODO: Move to database once prompt management is implemented
 */
const TRIBE_PROMPT_TEMPLATES: Record<string, string> = {
  legacist: 'Create a sophisticated moodboard showcasing classic, timeless heritage aesthetics. Include vintage luxury elements, traditional craftsmanship, refined elegance, and historical references. Focus on rich textures, ornate details, and aristocratic sensibilities.',
  modernist: 'Create a contemporary moodboard with minimalist, sleek design elements. Include clean lines, geometric shapes, modern architecture, innovative materials, and cutting-edge aesthetics. Focus on simplicity, functionality, and forward-thinking design.',
  naturalist: 'Create an organic moodboard celebrating natural beauty and earth-inspired aesthetics. Include botanical elements, raw materials, sustainable design, outdoor scenery, and eco-conscious themes. Focus on natural textures, earthy tones, and harmony with nature.',
  maximalist: 'Create a bold, vibrant moodboard with eclectic and expressive aesthetics. Include rich colors, mixed patterns, diverse textures, artistic expression, and layered compositions. Focus on abundance, creativity, and personal expression.',
  futurist: 'Create a forward-thinking moodboard with innovative, tech-inspired aesthetics. Include digital art, holographic elements, sci-fi references, advanced materials, and experimental design. Focus on innovation, technology, and future visions.',
};

/**
 * Generic fallback template for unknown tribes
 */
const GENERIC_TEMPLATE = 'Create a visually stunning moodboard showcasing the unique aesthetic and cultural elements of this subculture. Include diverse visual references, artistic elements, and distinctive style characteristics.';

/**
 * Get prompt template for a specific tribe
 * Returns generic template if tribe is not found
 */
export const getTribePromptTemplate = (tribeName: string): string => {
  const normalizedName = tribeName.toLowerCase().trim();
  return TRIBE_PROMPT_TEMPLATES[normalizedName] || GENERIC_TEMPLATE;
};

/**
 * Build a complete image generation prompt from tribe data
 * Combines tribe template, keywords, and additional context
 */
export const buildImagePrompt = (tribeData: TribePromptData): string => {
  const { tribeName, subcultureName, keywords } = tribeData;

  // Get base template
  const template = getTribePromptTemplate(tribeName);

  // Build keyword section
  const keywordSection = keywords.length > 0
    ? `Incorporate these style elements: ${keywords.join(', ')}.`
    : '';

  // Build subculture context
  const subcultureSection = `This represents the ${subcultureName} subculture and ${tribeName} tribe.`;

  // Combine all parts
  const parts = [
    template,
    keywordSection,
    subcultureSection,
    'Create a cohesive, high-quality visual composition suitable for a signature moodboard.',
  ].filter(Boolean);

  return parts.join(' ');
};
