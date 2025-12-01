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
- `Authorization: Bearer <SUPABASE_ANON_KEY>` (required - uses anon key for public access)

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

1. **Public Access**: This function is publicly accessible using the Supabase anon key for authentication
2. **Service Role Operations**: Internally uses the service role key to bypass RLS for database operations (safe for guest users)
3. **Fetch User Answer**: Retrieves the user's answer including moodboard details, selected brands, and keywords
4. **Calculate Tribe Scores**: Uses a scoring system based on moodboard, keywords, and brands
5. **Save to Database**: Creates a `user_results` record and associated `user_result_tribes` entries
6. **Return Response**: Sends the analysis results back to the client in camelCase format

## Scoring Logic

The function uses a point-based system to calculate tribe affinities:

1. **Moodboard Selection**: Each tribe in the selected subculture receives 2 points
2. **Keyword Selection**: Each selected keyword adds 1 point to its associated tribe
3. **Brand Selection**: Each selected brand adds 1 point to its associated tribe
4. **Dominant Tribe**: The tribe with the highest total points becomes the dominant tribe
5. **Percentage Calculation**: Each tribe's percentage is calculated as `(tribe_points / total_points) * 100`

## Environment Variables

Required environment variables (automatically provided by Supabase):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for bypassing RLS

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
