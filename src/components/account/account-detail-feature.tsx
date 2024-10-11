import { Box, Stack } from '@mantine/core'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { useParams } from 'react-router'
import { ExplorerLink } from '../cluster/cluster-ui'
import { AppHero } from '../ui/ui-layout'
import { ellipsify } from '../ui/ui-layout-helpers'
import { AccountBalance, AccountButtons, AccountTokens, AccountTransactions } from './account-ui'

export default function AccountDetailFeature() {
  const params = useParams() as { address?: string }
  const address = useMemo(() => {
    if (!params.address) {
      return
    }
    try {
      return new PublicKey(params.address)
    } catch (e) {
      console.log(`Invalid public key`, e)
    }
  }, [params])
  if (!address) {
    return <div>Error loading account</div>
  }

  return (
    <Stack>
      <AppHero
        title={<AccountBalance address={address} />}
        subtitle={
          <Box my="md">
            <ExplorerLink path={`account/${address}`} label={ellipsify(address.toString())} />
          </Box>
        }
      >
        <Box my="md">
          <AccountButtons address={address} />
        </Box>
      </AppHero>
      <Stack gap="lg">
        <AccountTokens address={address} />
        <AccountTransactions address={address} />
      </Stack>
    </Stack>
  )
}
