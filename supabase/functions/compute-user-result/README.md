# Compute User Result Edge Function

This Edge Function analyzes user answers (moodboard selection, brand preferences, and keywords) using Google's Gemini AI to determine their cultural tribe and subculture affinities.

## API Contract

### Endpoint
```
POST /functions/v1/compute-user-result
```

### Request

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <SUPABASE_ANON_KEY>` (or service role key)

**Body (camelCase):**
```json
{
  "userAnswerId": "uuid-of-user-answer"
}
```

### Response

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "userResultId": "uuid-of-created-result",
    "tribeId": "uuid-of-matched-tribe",
    "tribeName": "Name of the tribe",
    "subcultures": [
      {
        "subcultureId": "uuid-of-subculture",
        "subcultureName": "Name of subculture",
        "percentage": 45
      },
      {
        "subcultureId": "uuid-of-another-subculture",
        "subcultureName": "Another subculture",
        "percentage": 30
      }
    ]
  }
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "userAnswerId is required and must be a string"
  }
}
```

404 Not Found:
```json
{
  "success": false,
  "error": {
    "code": "USER_ANSWER_NOT_FOUND",
    "message": "User answer not found"
  }
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": {
    "code": "GEMINI_ERROR",
    "message": "Failed to analyze user preferences"
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `METHOD_NOT_ALLOWED` | 405 | Only POST requests are allowed |
| `INVALID_JSON` | 400 | Request body is not valid JSON |
| `INVALID_REQUEST` | 400 | Missing or invalid userAnswerId |
| `CONFIGURATION_ERROR` | 500 | Server configuration issue (missing API keys) |
| `USER_ANSWER_NOT_FOUND` | 404 | No user answer found with the given ID |
| `DATA_ERROR` | 500 | Failed to fetch required data (subcultures/tribes) |
| `GEMINI_ERROR` | 500 | Gemini API call failed |
| `DATABASE_ERROR` | 500 | Failed to save results to database |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## How It Works

1. **Fetch User Answer**: Retrieves the user's answer including moodboard details, selected brands, and keywords
2. **Fetch Reference Data**: Loads all available subcultures and tribes from the database
3. **AI Analysis**: Sends user preferences to Gemini AI with a carefully crafted prompt
4. **Parse Results**: Validates and parses Gemini's JSON response
5. **Save to Database**: Creates a `user_results` record and associated `user_result_subcultures` entries
6. **Return Response**: Sends the analysis results back to the client in camelCase format

## Analysis Logic

- **Subculture Matching**: Based primarily on moodboard selection and brand preferences
- **Tribe Selection**: Determined by combining subculture affinities with selected keywords
- **Percentage Calculation**: All subculture percentages must sum to exactly 100%

## Environment Variables

Required environment variables (configured in `supabase/config.toml`):

- `GEMINI_API_KEY`: Google Gemini API key
- `SUPABASE_URL`: Automatically provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Automatically provided by Supabase

## Local Testing

### Start Supabase locally:
```bash
supabase start
```

### Test the function:
```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/compute-user-result' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userAnswerId":"your-user-answer-uuid"}'
```

### View function logs:
```bash
supabase functions logs compute-user-result --local
```

## Deployment

Deploy to production:
```bash
supabase functions deploy compute-user-result
```

Set secrets in production:
```bash
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key
```

## Database Schema Dependencies

This function requires the following tables:
- `user_answers` (with foreign key to `moodboards`)
- `subcultures`
- `tribes`
- `user_results`
- `user_result_subcultures`

See migration file: `supabase/migrations/20251126011057_create_database_schema.sql`
