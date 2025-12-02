import { buildImagePrompt, getTribePromptTemplate } from './promptService';
import type { TribePromptData } from '../types';

describe('promptService', () => {
  describe('getTribePromptTemplate', () => {
    it('should return prompt template for known tribe', () => {
      const template = getTribePromptTemplate('Legacist');
      expect(template).toBeDefined();
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    });

    it('should return generic prompt template for unknown tribe', () => {
      const template = getTribePromptTemplate('UnknownTribe');
      expect(template).toBeDefined();
      expect(typeof template).toBe('string');
      expect(template).toContain('aesthetic');
    });

    it('should be case-insensitive', () => {
      const template1 = getTribePromptTemplate('Legacist');
      const template2 = getTribePromptTemplate('LEGACIST');
      const template3 = getTribePromptTemplate('legacist');
      expect(template1).toBe(template2);
      expect(template2).toBe(template3);
    });
  });

  describe('buildImagePrompt', () => {
    const mockTribeData: TribePromptData = {
      tribeId: '123',
      tribeName: 'Legacist',
      subcultureName: 'Heritage',
      keywords: ['classic', 'timeless', 'elegant'],
    };

    it('should build complete prompt with tribe template and keywords', () => {
      const prompt = buildImagePrompt(mockTribeData);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should include tribe-specific styling', () => {
      const prompt = buildImagePrompt(mockTribeData);

      // Should contain elements related to the tribe
      expect(prompt.toLowerCase()).toMatch(/classic|heritage|legacist|timeless/i);
    });

    it('should include keywords in the prompt', () => {
      const prompt = buildImagePrompt(mockTribeData);

      // At least one keyword should be present
      const hasKeyword = mockTribeData.keywords.some(
        keyword => prompt.toLowerCase().includes(keyword.toLowerCase())
      );
      expect(hasKeyword).toBe(true);
    });

    it('should handle empty keywords array', () => {
      const dataWithoutKeywords: TribePromptData = {
        ...mockTribeData,
        keywords: [],
      };

      const prompt = buildImagePrompt(dataWithoutKeywords);
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should handle different tribes differently', () => {
      const legacistPrompt = buildImagePrompt({
        ...mockTribeData,
        tribeName: 'Legacist',
      });

      const modernistPrompt = buildImagePrompt({
        ...mockTribeData,
        tribeName: 'Modernist',
      });

      // Different tribes should produce different prompts
      expect(legacistPrompt).not.toBe(modernistPrompt);
    });

    it('should return a prompt suitable for image generation', () => {
      const prompt = buildImagePrompt(mockTribeData);

      // Basic validation that it looks like an image prompt
      expect(prompt.length).toBeGreaterThan(20); // Not too short
      expect(prompt.length).toBeLessThan(1000); // Not too long
    });
  });
});
