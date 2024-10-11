import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { createTheme, DEFAULT_THEME, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { ReactNode } from 'react'

const brand = DEFAULT_THEME.colors.violet

const theme = createTheme({
  colors: { brand: brand },
  primaryColor: 'brand',
})

export function AppTheme({ children }: { children: ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <Notifications />
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  )
}
