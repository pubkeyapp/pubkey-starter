import { Box, Container } from '@mantine/core'
import { useWallet } from '@solana/wallet-adapter-react'
import { Navigate } from 'react-router-dom'
import { WalletButton } from '../solana/solana-provider'

export default function AccountListFeature() {
  const { publicKey } = useWallet()

  if (publicKey) {
    return <Navigate to={`/account/${publicKey.toString()}`} replace />
  }

  return (
    <Box py={64}>
      <Container size="sm" ta="center">
        <WalletButton />
      </Container>
    </Box>
  )
}
