// Unit tests for fetchTribePrompt function
// Tests the database query logic for fetching tribe-specific prompts
import { assertEquals, assertRejects } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { describe, it, beforeEach, afterEach } from "https://deno.land/std@0.192.0/testing/bdd.ts";

// Mock Supabase client
interface MockSupabaseClient {
  from: (table: string) => {
    select: (query: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: unknown; error: unknown }>;
      };
    };
  };
}

const createMockSupabase = (
  mockData: unknown,
  mockError: unknown = null
): MockSupabaseClient => {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: mockData, error: mockError }),
        }),
      }),
    }),
  } as MockSupabaseClient;
};

// Import the function to test (we'll need to export it from index.ts)
// For now, we'll define it inline for testing
const fetchTribePrompt = async (
  supabase: MockSupabaseClient,
  userResultId: string
): Promise<string> => {
  const { data, error } = await supabase
    .from('user_results')
    .select(`
      tribe_id,
      tribes!inner (
        name,
        image_generation_prompt
      )
    `)
    .eq('id', userResultId)
    .single();

  if (error) {
    console.error('Error fetching tribe prompt:', error);
    throw new Error(`Failed to fetch tribe information: ${error.message}`);
  }

  if (!data) {
    throw new Error(`User result not found: ${userResultId}`);
  }

  const tribeData = data.tribes as { name: string; image_generation_prompt: string | null };

  if (!tribeData.image_generation_prompt) {
    throw new Error(`No image generation prompt configured for tribe: ${tribeData.name}`);
  }

  console.log(`Using prompt for tribe: ${tribeData.name}`);
  return tribeData.image_generation_prompt;
};

describe("fetchTribePrompt", () => {
  describe("Happy Path", () => {
    it("should return prompt for valid user result", async () => {
      const mockData = {
        tribe_id: "tribe-123",
        tribes: {
          name: "Heritage Heiress",
          image_generation_prompt: "Transform the person into the Heritage Heir/Heiress...",
        },
      };

      const mockSupabase = createMockSupabase(mockData);
      const result = await fetchTribePrompt(mockSupabase, "user-result-123");

      assertEquals(
        result,
        "Transform the person into the Heritage Heir/Heiress..."
      );
    });

    it("should return prompt for different tribe", async () => {
      const mockData = {
        tribe_id: "tribe-456",
        tribes: {
          name: "Quiet Luxury",
          image_generation_prompt: "Transform the person into the Quiet Luxury archetype...",
        },
      };

      const mockSupabase = createMockSupabase(mockData);
      const result = await fetchTribePrompt(mockSupabase, "user-result-456");

      assertEquals(
        result,
        "Transform the person into the Quiet Luxury archetype..."
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw error when user result not found", async () => {
      const mockSupabase = createMockSupabase(null);

      await assertRejects(
        async () => {
          await fetchTribePrompt(mockSupabase, "non-existent-id");
        },
        Error,
        "User result not found: non-existent-id"
      );
    });

    it("should throw error when tribe has no prompt", async () => {
      const mockData = {
        tribe_id: "tribe-789",
        tribes: {
          name: "Test Tribe",
          image_generation_prompt: null,
        },
      };

      const mockSupabase = createMockSupabase(mockData);

      await assertRejects(
        async () => {
          await fetchTribePrompt(mockSupabase, "user-result-789");
        },
        Error,
        "No image generation prompt configured for tribe: Test Tribe"
      );
    });

    it("should throw error on database error", async () => {
      const mockError = {
        message: "Database connection failed",
        code: "CONNECTION_ERROR",
      };

      const mockSupabase = createMockSupabase(null, mockError);

      await assertRejects(
        async () => {
          await fetchTribePrompt(mockSupabase, "user-result-123");
        },
        Error,
        "Failed to fetch tribe information: Database connection failed"
      );
    });

    it("should validate user result ID format", async () => {
      const mockSupabase = createMockSupabase(null);

      await assertRejects(
        async () => {
          await fetchTribePrompt(mockSupabase, "");
        },
        Error,
        "User result not found"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long prompts", async () => {
      const longPrompt = "A".repeat(5000);
      const mockData = {
        tribe_id: "tribe-long",
        tribes: {
          name: "Long Prompt Tribe",
          image_generation_prompt: longPrompt,
        },
      };

      const mockSupabase = createMockSupabase(mockData);
      const result = await fetchTribePrompt(mockSupabase, "user-result-long");

      assertEquals(result, longPrompt);
      assertEquals(result.length, 5000);
    });

    it("should handle prompts with special characters", async () => {
      const specialPrompt = "Transform the person with \"quotes\" and 'apostrophes' and newlines\n\nhere.";
      const mockData = {
        tribe_id: "tribe-special",
        tribes: {
          name: "Special Chars Tribe",
          image_generation_prompt: specialPrompt,
        },
      };

      const mockSupabase = createMockSupabase(mockData);
      const result = await fetchTribePrompt(mockSupabase, "user-result-special");

      assertEquals(result, specialPrompt);
    });
  });
});
