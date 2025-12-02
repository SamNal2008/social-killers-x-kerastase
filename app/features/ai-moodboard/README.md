# AI Moodboard Feature

Generates personalized moodboard images using Gemini AI based on user's tribe and selfie.

## Structure

```
ai-moodboard/
├── components/
│   ├── AiMoodboardScreen.tsx       # Main screen component
│   ├── AiMoodboardScreen.test.tsx  # Component tests
│   └── index.ts                     # Exports
├── hooks/
│   ├── useAiMoodboard.ts           # Hook for state management
│   └── useAiMoodboard.test.ts      # Hook tests
├── services/
│   ├── geminiImageService.ts       # Gemini API integration
│   ├── geminiImageService.test.ts  # Service tests
│   ├── promptService.ts            # Prompt building logic
│   └── promptService.test.ts       # Service tests
├── types/
│   └── index.ts                     # TypeScript types
└── README.md                        # This file
```

## Flow

1. User completes questionnaire → `userResultId` stored
2. User captures selfie in `/camera`
3. Navigate to `/ai-moodboard` with state
4. Fetch user result (tribe info) from database
5. Build prompt based on tribe
6. Generate 3 images using Gemini API
7. Store images in Supabase Storage
8. Display in carousel with navigation
9. Allow image download

## API Integration

Uses Supabase Edge Function to securely call Gemini API:
- Function: `generate-ai-moodboard`
- Endpoint: `/functions/v1/generate-ai-moodboard`
- Method: POST

## Dependencies

- `~/shared/services/supabase` - Supabase client
- `~/shared/components/Polaroid` - Polaroid card component
- `~/shared/components/CircleButton` - Navigation buttons
- `~/shared/components/Button` - Download button
- `~/shared/utils/localStorage` - User result storage
