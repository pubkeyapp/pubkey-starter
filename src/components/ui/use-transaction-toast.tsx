import { ExplorerLink } from '@/components/cluster/cluster-ui.tsx'
import { toastSuccess } from '@/components/ui/ui-layout-helpers.ts'
import { Box, Text } from '@mantine/core'

export function useTransactionToast() {
  return (signature: string) => {
    toastSuccess({
      message: (
        <Box>
          <Text size="lg">Transaction sent</Text>
          <ExplorerLink path={`tx/${signature}`} label={'View Transaction'} />
        </Box>
      ),
    })
  }
}
