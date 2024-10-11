import { AppTheme } from '@/app/app-theme.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClusterProvider } from '../components/cluster/cluster-data-access'
import { SolanaProvider } from '../components/solana/solana-provider'
import { AppRoutes } from './app-routes'

const client = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={client}>
      <ClusterProvider>
        <AppTheme>
          <SolanaProvider>
            <AppRoutes />
          </SolanaProvider>
        </AppTheme>
      </ClusterProvider>
    </QueryClientProvider>
  )
}
