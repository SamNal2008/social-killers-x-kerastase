// Global Supabase mock for all unit tests
export const createMockSupabaseResponse = (data: any = null, error: any = null) => ({
  data,
  error,
});

export const createMockSupabaseClient = () => {
  const mockSingle = jest.fn();
  const mockSelect = jest.fn(() => ({ single: mockSingle }));
  const mockInsert = jest.fn(() => ({ select: mockSelect }));
  const mockUpdate = jest.fn(() => ({ select: mockSelect }));
  const mockDelete = jest.fn(() => ({ select: mockSelect }));
  const mockUpsert = jest.fn(() => ({ select: mockSelect }));
  const mockEq = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockNeq = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockGt = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockLt = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockGte = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockLte = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockLike = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockIlike = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockIs = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockIn = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockContains = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockContainedBy = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockRangeGt = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockRangeLt = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockRangeGte = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockRangeLte = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockRangeAdjacent = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockOverlaps = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockTextSearch = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockMatch = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockNot = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockOr = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockFilter = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockOrder = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockLimit = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockRange = jest.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockAbortSignal = jest.fn(() => ({ select: mockSelect, single: mockSingle }));

  const mockQueryBuilder = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    upsert: mockUpsert,
    eq: mockEq,
    neq: mockNeq,
    gt: mockGt,
    lt: mockLt,
    gte: mockGte,
    lte: mockLte,
    like: mockLike,
    ilike: mockIlike,
    is: mockIs,
    in: mockIn,
    contains: mockContains,
    containedBy: mockContainedBy,
    rangeGt: mockRangeGt,
    rangeLt: mockRangeLt,
    rangeGte: mockRangeGte,
    rangeLte: mockRangeLte,
    rangeAdjacent: mockRangeAdjacent,
    overlaps: mockOverlaps,
    textSearch: mockTextSearch,
    match: mockMatch,
    not: mockNot,
    or: mockOr,
    filter: mockFilter,
    order: mockOrder,
    limit: mockLimit,
    range: mockRange,
    abortSignal: mockAbortSignal,
    single: mockSingle,
  };

  const mockFrom = jest.fn(() => mockQueryBuilder);

  // Auth mock
  const mockAuth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    setSession: jest.fn(),
    refreshSession: jest.fn(),
  };

  // Storage mock
  const mockStorage = {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      list: jest.fn(),
      remove: jest.fn(),
      createSignedUrl: jest.fn(),
      createSignedUrls: jest.fn(),
      getPublicUrl: jest.fn(),
      move: jest.fn(),
      copy: jest.fn(),
    })),
  };

  // Realtime mock
  const mockRealtime = {
    channel: jest.fn(() => ({
      on: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      send: jest.fn(),
    })),
    removeChannel: jest.fn(),
    removeAllChannels: jest.fn(),
    getChannels: jest.fn(),
  };

  // Functions mock
  const mockFunctions = {
    invoke: jest.fn(),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    storage: mockStorage,
    realtime: mockRealtime,
    functions: mockFunctions,
    // Expose all the mock functions for easy access in tests
    _mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      upsert: mockUpsert,
      single: mockSingle,
      eq: mockEq,
      neq: mockNeq,
      gt: mockGt,
      lt: mockLt,
      gte: mockGte,
      lte: mockLte,
      like: mockLike,
      ilike: mockIlike,
      is: mockIs,
      in: mockIn,
      contains: mockContains,
      containedBy: mockContainedBy,
      rangeGt: mockRangeGt,
      rangeLt: mockRangeLt,
      rangeGte: mockRangeGte,
      rangeLte: mockRangeLte,
      rangeAdjacent: mockRangeAdjacent,
      overlaps: mockOverlaps,
      textSearch: mockTextSearch,
      match: mockMatch,
      not: mockNot,
      or: mockOr,
      filter: mockFilter,
      order: mockOrder,
      limit: mockLimit,
      range: mockRange,
      abortSignal: mockAbortSignal,
      auth: mockAuth,
      storage: mockStorage,
      realtime: mockRealtime,
      functions: mockFunctions,
    },
  };
};

// Create the global mock instance
export const mockSupabaseClient = createMockSupabaseClient();

// Mock the createClient function
export const createClient = jest.fn(() => mockSupabaseClient);

// Export the supabase client mock
export const supabase = mockSupabaseClient;
