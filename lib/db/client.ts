// Mock Supabase Client for endpoints that have not yet been migrated to Firebase
// This allows the build to pass while we migrate incrementally.

const mockResponse = { data: [] as any[], error: new Error('Not migrated to Firebase yet') };

const mockChain = {
  select: (...args: any[]) => mockChain,
  eq: (...args: any[]) => mockChain,
  neq: (...args: any[]) => mockChain,
  in: (...args: any[]) => mockChain,
  is: (...args: any[]) => mockChain,
  order: (...args: any[]) => mockChain,
  limit: (...args: any[]) => mockChain,
  single: (...args: any[]) => Promise.resolve({ data: null, error: new Error('Not migrated') }),
  insert: (...args: any[]) => mockChain,
  update: (...args: any[]) => mockChain,
  delete: (...args: any[]) => mockChain,
  upsert: (...args: any[]) => mockChain,
  then: (resolve: any) => resolve(mockResponse),
  catch: (reject: any) => Promise.resolve(mockResponse),
};

export const db = {
  from: (...args: any[]) => mockChain as any,
  rpc: (...args: any[]) => Promise.resolve(mockResponse),
};
