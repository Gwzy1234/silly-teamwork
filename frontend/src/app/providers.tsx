import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider, theme as antTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { queryClient } from './query-client'
import { SessionExpiryWatcher } from '../features/auth/components/SessionExpiryWatcher'
import { usePreferencesStore } from '../features/settings/store'

export function AppProviders({ children }: PropsWithChildren) {
  const theme = usePreferencesStore((state) => state.theme)

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 10,
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
        }}
      >
        <AntApp className={`theme-${theme}`}>
          <SessionExpiryWatcher />
          {children}
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
