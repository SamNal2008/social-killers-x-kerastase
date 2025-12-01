# Tribe Details Feature

## Overview
This feature displays the user's dominant tribe information after they complete the onboarding process. It shows the tribe name and description, providing a deeper understanding of their personality profile.

## Architecture
Following the screaming architecture pattern, this feature is organized by domain:

```
app/features/subculture-details/
├── components/
│   ├── DetailsScreen.tsx          # Main component displaying tribe details
│   └── DetailsScreen.test.tsx     # Component tests
├── hooks/
│   └── useTribeDetails.ts         # Data-fetching hook for tribe details
├── services/
│   ├── tribeService.ts            # Service for fetching tribe data
│   └── tribeService.test.ts       # Service tests
├── types/
│   └── index.ts                   # TypeScript interfaces
└── README.md                      # This file
```

## User Flow
1. User completes onboarding (name, moodboard, keywords, brands)
2. System computes results and navigates to `/results?userResultId=XXX`
3. User sees tribe percentages and clicks "Let's deep dive"
4. User is navigated to `/details?userResultId=XXX`
5. System fetches and displays tribe information

## Key Components

### DetailsScreen
The main component that:
- Fetches tribe data using the service
- Displays loading, error, and success states
- Shows tribe name, description, and CTA button
- Provides back navigation to results page

**Props**:
- `userResultId: string` - The user result ID to fetch tribe for

### tribeService
Service layer for database operations:
- `fetchTribeByUserResultId(userResultId: string): Promise<TribeDetails>`

**Database Queries**:
1. Fetch user_results by ID → join tribes
2. Return tribe details (name, subtitle, description, dos, donts)

## Design Implementation
Based on Figma design (node 4-365):
- Mobile-first responsive layout
- Typography: Crimson Pro for title, Inter for body
- Gradient gold decorative line
- Italic quote formatting for description
- Dark CTA button: "Generate my AI moodboard"

## localStorage Integration
The `userResultId` is stored in localStorage for persistence:
- Key: `kerastase_user_result_id`
- Set in: `home.tsx` after computing results
- Used in: Details route to fetch tribe data

## Testing
Comprehensive test coverage (19+ tests):
- Unit tests for localStorage utils
- Unit tests for tribeService
- Component tests for DetailsScreen
- Integration tests for navigation flow

## Routes
- `/details?userResultId=XXX` - Details route that renders DetailsScreen

## Error Handling
- Missing userResultId: Shows error message
- Database errors: Displays user-friendly error
- No tribe found: Shows appropriate error message

## Future Enhancements
- AI moodboard generation (button currently placeholder)
- Social sharing functionality
- Subculture exploration features
