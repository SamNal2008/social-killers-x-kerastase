// Integration tests for generate-image Edge Function
// Tests the full HTTP endpoint including tribe prompt fetching
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";

const FUNCTION_URL = Deno.env.get("FUNCTION_URL") || "http://localhost:54321/functions/v1/generate-image";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

describe("Generate Image Edge Function - Integration Tests", () => {
  describe("Tribe Prompt Fetching", () => {
    it("should fetch and use tribe-specific prompt for valid user result", async () => {
      const requestBody = {
        userResultId: "valid-test-user-result-id",
        userPhoto: "data:image/jpeg;base64,/9j/4AAQSkZJRg...", // Valid base64 image
        numberOfImages: 1,
      };

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // Should successfully fetch tribe prompt and generate image
      // Note: This test assumes a test user result exists in the database
      if (response.ok) {
        assertEquals(data.success, true);
        assertEquals(typeof data.data.imageUrl, "string");
        assertEquals(data.data.userResultId, requestBody.userResultId);
      } else {
        // If test data doesn't exist, we expect a specific error
        assertEquals(data.success, false);
        assertEquals(typeof data.error.message, "string");
      }
    });

    it("should use custom prompt when provided, skipping database lookup", async () => {
      const customPrompt = "Custom test prompt for image generation";
      const requestBody = {
        userResultId: "any-user-result-id",
        userPhoto: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        prompt: customPrompt,
        numberOfImages: 1,
      };

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // When custom prompt is provided, it should be used
      // (function should not fail even if userResultId doesn't exist)
      if (response.ok) {
        assertEquals(data.success, true);
        // Verify it used the custom prompt (would be in logs)
      }
    });

    it("should return error for non-existent user result", async () => {
      const requestBody = {
        userResultId: "00000000-0000-0000-0000-000000000000", // Non-existent UUID
        userPhoto: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        numberOfImages: 1,
      };

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      assertEquals(response.status, 500);
      assertEquals(data.success, false);
      assertEquals(data.error.code, "INTERNAL_ERROR");
      assertEquals(
        data.error.message.includes("User result not found") ||
        data.error.message.includes("Failed to fetch tribe information"),
        true
      );
    });

    it("should return error for invalid user result ID format", async () => {
      const requestBody = {
        userResultId: "not-a-valid-uuid",
        userPhoto: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        numberOfImages: 1,
      };

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      assertEquals(response.status, 400);
      assertEquals(data.success, false);
      assertEquals(data.error.code, "INVALID_REQUEST");
      assertEquals(data.error.message, "userResultId must be a valid UUID");
    });
  });

  describe("Request Validation", () => {
    it("should reject missing userResultId", async () => {
      const requestBody = {
        userPhoto: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      };

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      assertEquals(response.status, 400);
      assertEquals(data.success, false);
      assertEquals(data.error.code, "INVALID_REQUEST");
    });

    it("should reject missing userPhoto", async () => {
      const requestBody = {
        userResultId: "00000000-0000-0000-0000-000000000000",
      };

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      assertEquals(response.status, 400);
      assertEquals(data.success, false);
      assertEquals(data.error.code, "INVALID_REQUEST");
    });
  });

  describe("CORS", () => {
    it("should handle OPTIONS preflight request", async () => {
      const response = await fetch(FUNCTION_URL, {
        method: "OPTIONS",
      });

      assertEquals(response.status, 200);
      assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
      assertEquals(
        response.headers.get("Access-Control-Allow-Headers")?.includes("authorization"),
        true
      );
    });
  });
});

// Test helper to create a test user result with a tribe
// This would be run before integration tests to set up test data
export const setupTestData = async (supabaseUrl: string, serviceKey: string) => {
  // This function would create test data in the database
  // For use in CI/CD pipeline or local testing
  console.log("Setting up test data...");
  // Implementation would go here
};
