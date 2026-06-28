import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#6B1A2C',
            colorSuccess: '#1F8A5B',
            colorWarning: '#E89B2C',
            colorError: '#C5341C',
            colorInfo: '#6B1A2C',
            fontFamily: "'Inter', sans-serif",
            borderRadius: 8,
          },
          components: {
            Menu: {
              darkItemBg: '#3A0E1A',
              darkSubMenuItemBg: '#2E0B14',
              darkItemSelectedBg: '#6B1A2C',
              darkItemSelectedColor: '#C49A3A',
              darkItemHoverBg: '#5A1626',
              darkItemHoverColor: '#FBF4E6',
            },
            Layout: {
              siderBg: '#3A0E1A',
              headerBg: '#ffffff',
              headerHeight: 60,
            },
            Table: {
              headerBg: '#FBF4E6',
              headerColor: '#4A1220',
              rowHoverBg: '#FBF4E611',
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
