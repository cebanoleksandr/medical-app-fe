import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'
import { queryClient } from './api/queryClient'
import { theme } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider enableCssLayer>
      {/* MUI goes between Tailwind's preflight and utilities: MUI beats the
          reset, utility classes beat MUI. Declared here because emotion's
          styles are inserted before index.css, and the first declaration wins. */}
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
)
