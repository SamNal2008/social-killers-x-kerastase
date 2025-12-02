-- Migration: Add Image Generation Prompt to Tribes Table
-- Description: Adds image_generation_prompt column to tribes table and populates
--              it with specific prompts for each tribe to be used with Gemini API
-- Author: Generated via Claude Code
-- Date: 2025-12-02

-- ============================================================================
-- STEP 1: Add image_generation_prompt column to tribes table
-- ============================================================================

ALTER TABLE tribes
  ADD COLUMN IF NOT EXISTS image_generation_prompt TEXT;

-- ============================================================================
-- STEP 2: Populate image_generation_prompt for each tribe
-- ============================================================================

-- Heritage Heiress
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the Heritage Heir/Heiress: a refined modern figure who blends legacy with contemporary quiet luxury. Keep the face extremely faithful to the selfie, with realistic skin texture and soft premium lighting.

If the person is a woman: style her in a crisp white shirt or tailored silk blouse, or a minimalist couture dress in ivory or champagne. Pair with modern heritage jewelry such as gold chains, pearls, or delicate diamonds. Hair polished and elegant.

If the person is a man: style him in a refined white shirt or a tailored cream/ivory jacket with clean lines. Subtle heritage details such as cufflinks, a slim bracelet, or understated jewelry. Grooming sharp and natural.

Place them in a sophisticated heritage setting with a modern touch: cream or golden interiors, classic architectural details, soft daylight or warm ambient glow. Capture them from head to mid-torso or full body, with composed, serene gestures.

Editorial quiet-luxury mood, cinematic depth, warm grading, and an atmosphere of modern heritage elegance.'
WHERE name = 'Heritage Heiress';

-- Quiet Luxury
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the Quiet Luxury archetype: an effortlessly refined, understated, high-end individual who embodies silent status and flawless minimalism. Keep their face extremely faithful to the selfie with realistic skin texture and natural detail.

If the person is a woman: style her in muted luxury tones (cream, camel, navy, charcoal) with impeccably tailored pieces such as a crisp white shirt, silk blouse, cashmere knit, or structured minimal dress. Add subtle gold jewelry or sculptural earrings. Hair is polished yet natural—sleek bun, soft blowout, or controlled waves.

If the person is a man: style him in elevated essentials in the same muted palette—tailored trousers, lightweight knits, suede overshirts, refined polos, or modern soft-shoulder blazers. Add discreet accessories like a leather belt, luxury watch, or sunglasses. Hair is groomed with natural, quiet precision.

Place them in a discreetly luxurious environment: a sunlit private terrace, a refined heritage interior, or a minimal modern space with soft daylight. Use neutral textures (linen, stone, wood) and a calm, intimate mood.

Capture them from head to mid-torso with relaxed, poised gestures—adjusting a sleeve, resting an arm, or gazing softly off camera. Ultra-premium editorial quality with cinematic softness, refined color grading, and high authenticity.'
WHERE name = 'Quiet Luxury';

-- Conscious Hedonist
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the Conscious Hedonist: a serene, sensual individual who embodies slow living, tactile pleasure, and grounded elegance. Keep their face extremely faithful to the selfie with natural, realistic skin texture, soft glow, and minimal retouching. Style them in fluid, breathable fabrics—linen, silk, organic cotton—using warm earthy tones like cream, sand, clay, stone. Prioritise movement, drape, and texture.
If it''s a woman: wrap silhouettes, deep but natural necklines, relaxed tailoring, soft balloon sleeves, artisanal jewelry in organic shapes (hammered gold, natural shells, sculpted ceramics).
If it''s a man: relaxed suits, open linen shirts, loose trousers, monochrome layers, subtle handcrafted accessories (woven leather, raw metal, natural-bead necklaces).

Place them in a refined, nature-connected environment: Mediterranean stone walls, dune landscapes, sunlit interiors with textured plaster, dry grass fields, or rocky coastlines. Use warm golden sunlight, long soft shadows, and gentle wind for natural movement in fabric or hair. Capture from head to mid-torso or full-body, with a calm, grounded posture—hands in pockets, leaning softly, or standing still with contemplative presence.

Editorial realism with warm daylight grading, airy depth of field, tactile surfaces, and a sensory, quietly luxurious atmosphere.'
WHERE name = 'Conscious Hedonist';

-- Clean Ritualists
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the Clean Ritualist: a serene, disciplined, minimalist individual who embodies clarity, purity, and elevated simplicity. Keep their face extremely faithful to the selfie with realistic skin texture and natural glow.

If female: style her in a pristine white robe or a structured cream lounge set, with subtle gold or silver accents (small hoops, fine ring) and a sleek bun or wrapped towel. Include refined skincare gestures such as a luminous face mask, under-eye patches, or applying serum with precision.

If male: style him in a clean white robe, or cream loungewear. Include refined skincare elements such as luminous face masks or under-eye patches applied with precision.

Place them in a calm, uncluttered bathroom: warm natural light, stone or sand-toned walls, matte textures, clean glass panels, and modern fixtures (black steel, wood cabinetry). The scene feels like a high-end spa ritual anchored in real, contemporary architecture.

Capture them from head to mid-torso, with a composed, serene posture—eyes soft or closed, gentle tilt of the head, mindful gesture. Editorial quiet-luxury mood, science-driven skincare aesthetic, minimalist composition, premium soft color grading.'
WHERE name = 'Clean Ritualists';

-- Sillage Seeker
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the Sillage Seeker: an introspective, sensual figure whose elegance comes from ritual, scent, and slow beauty. Keep their face extremely faithful to the selfie.

If it''s a woman: style her in a soft, draped silk robe or minimal loungewear in warm neutral tones, with delicate gold jewelry that catches the light.
If it''s a man: style him in an open linen shirt, relaxed resort tailoring, or sunlit neutrals that echo effortless Mediterranean sensuality. Accessories remain subtle—sun-kissed skin, a fine necklace, or bare simplicity.

Add a fragrance-focused gesture: holding a perfume bottle close to the face, misting scent on the neck, or presenting the flacon toward the camera with quiet confidence. The bottle should feel premium, glowing in the light.

Place her in a softly lit sanctuary-like bedroom: warm candles glowing on a bedside table, layered fabrics, a large mirror, textures of linen, cashmere, and warm beige walls. Capture a calm, cinematic atmosphere with diffused light, a sense of stillness, and sensual depth — like a quiet moment before bed.

Capture them from head to mid-torso or slightly wider if outdoors, with relaxed posture and an introspective gaze (eyes soft, half-closed, or looking away from camera).

Overall mood: elevated sensory ritual, premium fragrance editorial, warm cinematic color grading, sunlit glow, tactile textures, and a refined aura of quiet, mastered seduction.'
WHERE name = 'Sillage Seeker';

-- Cosmic Explorer
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the Cosmic Explorer: a modern mystic captured in a warm, cinematic, Pinterest-style portrait. Keep their face extremely faithful to the selfie with natural texture, no smoothing. For women: style her in dark, romantic fabrics such as lace, velvet, or embroidered shawls in black or deep burgundy, with delicate vintage jewelry, soft waves or loose hair, and a subtle headpiece or scarf. For men: style him in layered textured pieces like velvet jackets, patterned scarves, or embroidered wraps, with symbolic rings or talismans and naturally tousled hair. The vibe should feel lived-in and intimate, never theatrical. Place the person in a low-lit divination setting inspired by the Pinterest reference: a small table with a crystal ball, scattered tarot cards, old glassware, candles melting naturally, rich textures, and a dark background full of depth. Use warm candlelight, soft falloff, light film grain, and subtle lens blur to evoke a nostalgic, analog mood. Frame the portrait mid-shot (preferred) or close-up, keeping the person slightly leaned in over the table, with a calm, introspective, almost hypnotic expression. The final image should look like a realistic Pinterest photograph — warm, moody, tactile, imperfect, and deeply atmospheric.'
WHERE name = 'Cosmic Explorer';

-- Urban Muse Energizer
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the *Urban Muse Energizer*: a vibrant, expressive, modern figure blending art, fashion, and urban culture. Keep their face extremely faithful to the selfie.

If female: curator-inspired Ganni aesthetic — bold yet refined pieces: structured mini skirt or shorts, sculptural jacket, oversized knits, strong textures, arty details, statement bags, modern ballerina-inspired shoes. Contemporary color palette: beige, navy, grey, hints of burgundy or graphic patterns.

If male: street-tailored look inspired by A$AP Rocky and high-fashion street style — oversized blazer or premium leather jacket, shirt + stylized tie, logo cap (NY, Chicago), dark sunglasses, impeccably cut wide-leg trousers. Attitude is effortless yet highly fashionable, mixing tailoring with street culture.

Include a metallic or fashion-signature detail (pin, brooch, visible accessory).

Background: dynamic New York street scene (Soho) — cast-iron buildings, fire escapes, yellow cabs, blurred pedestrians.

Show the person from head to mid-torso, with lively movement (walking, turning, adjusting the jacket, natural expressive gesture).

Premium editorial mood: cinematic daylight, sharp details, candid motion, creative urban energy.'
WHERE name = 'Urban Muse Energizer';

-- Stagebreaker
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the Stage Breaker: a magnetic live performer captured mid-concert, with their face kept extremely faithful to the selfie.

For a woman: dress her in a modern ethereal stagewear inspired by today''s top performers: sleek satin or structured mini-dresses, sculptural tops, sharp tailoring, or sheer layers with subtle sparkle that catches light naturally and vibrant, atmospheric colors. Think elevated, contemporary, runway-ready performance wear.

For a man: style him in *current concert fashion* — fitted black or satin shirts, open collars, slim tailored trousers, leather accents, embroidered or shimmering jackets, or modern rock silhouettes with texture and depth. Avoid costumes; keep it authentic, stylish, and stage-ready.

Add real performance details: in-ear monitors, discreet microphone, minimal jewelry, soft skin highlights adapted to stage lighting, natural hair movement shaped by motion (loose waves, tied back, tousled volume).

Place them on a realistic concert stage with warm spotlights, soft haze, backlights, audience bokeh, and natural beams. No sci-fi or exaggerated effects.

Capture a dynamic, emotional pose — singing into the microphone, playing guitar, or mid-movement — prioritizing *realism, atmosphere, and expressive presence*.

The mood: cinematic, editorial, Vogue-meets-live-show. Premium color grading, shallow depth of field, natural motion blur, authentic textures, and high-end stage realism.'
WHERE name = 'Stagebreaker';

-- Gloss Goddess
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the *Gloss Goddess*: a hyper-polished, Hollywood-glam persona captured in the intimate moments of getting ready. Keep their face extremely faithful to the selfie — same bone structure, hair, features, expressions, and natural skin texture.

If the person is a woman: style her in elevated getting-ready attire such as a plush white robe, a silk dressing gown. Makeup is glamorous yet realistic: lifted eyeliner, luminous skin, sculpted glow, refined lips.

If the person is a man: style him in a refined, modern Hollywood prep look — an open white shirt, a tailored waistcoat. Add subtle grooming elements: clean glow on the skin, light definition around eyes or cheekbones for a cinematic finish.

Include authentic preparation details for both: makeup artists'' hands, brushes, hairstyling tools, soft glints of jewelry, or subtle product shine. Keep everything natural and elegant, never artificial.

Place them in a cinematic backstage or dressing-room environment: warm spotlights, soft shadows, mirrors, diffused glows, hints of crew around them. Capture a poised, serene, or focused moment — sitting in a makeup chair, adjusting hair, or glancing toward a mirror.

The mood is ultra-glamorous and intimate, like a Vogue Hollywood beauty editorial. Prioritize ultra-realistic rendering, luxury texture, and cinematic color grading — never exaggerated or over-stylized.'
WHERE name = 'Gloss Goddess';

-- Edgy Aesthetes
UPDATE tribes
SET image_generation_prompt = 'Transform the person into the Edgy Aesthete: a raw, magnetic, hyper-modern beauty muse. Keep the face extremely faithful to the selfie — same bone structure, same features, same expressions — with realistic skin texture and premium detail.

For women: style her with sleek hair (clean slick-back, tight braids, or wet texture), very minimal baby hairs, sharp eyeliner, sculpted contour, luminous highlights, and glossed or vinyl-finish lips.

For men: style him with tousled or wet-textured hair, subtle smudged eyeliner or defined eyes, luminous skin, and modern jewelry (rings, chains, earrings) with an editorial edge.

Outfits: inspired by the provided references — dark or textured fabrics, leather or vinyl jackets, deep V silhouettes, fitted shirts, bold tailoring, or modern rock-inspired pieces. High-fashion, not costume-like.

Place them inside the exact hair studio from the reference. Preserve the same angle and composition of the salon: the large circular mirror, sculptural ring lights overhead, the tall windows with greenery outside, cool-toned walls, and the clean, architectural layout of the space. The environment should be clearly visible around the subject — not blurred or cropped.

Framing: mid-shot (head to mid-torso), wide enough to show the person *and* the salon backdrop. Capture intensity and editorial tension — direct gaze, controlled posture, raw presence — while keeping the background composition faithful to the original location.

Overall mood: avant-garde fashion portrait with cinematic lighting, controlled shadows, crisp highlights, and ultra-realistic texture. A high-end beauty campaign look with attitude, modern edge, and authentic detail.'
WHERE name = 'Edgy Aesthetes';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN tribes.image_generation_prompt IS 'Prompt used for generating personalized images via Gemini API for this tribe';
