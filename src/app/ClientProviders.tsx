"use client";

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ApolloProvider } from '@apollo/client';
import { ConfigProvider } from 'antd';
import { AppProvider } from '@/contexts/AppContext';
import { apolloClient } from '@/lib/apollo-client';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ApolloProvider client={apolloClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 8,
            },
          }}
        >
          <AppProvider>
            {children}
          </AppProvider>
        </ConfigProvider>
      </ApolloProvider>
    </UserProvider>
  );
}
