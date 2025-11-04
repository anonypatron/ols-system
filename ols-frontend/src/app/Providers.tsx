'use client';

import { UserProvider } from './context/UserProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      { children }
    </UserProvider>
  );
}