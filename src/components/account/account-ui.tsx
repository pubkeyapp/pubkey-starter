import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { IconParachute, IconRefresh } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { ExplorerLink } from '../cluster/cluster-ui'
import { AppModal, UiAlert } from '../ui/ui-layout'
import { ellipsify } from '../ui/ui-layout-helpers'
import {
  useGetBalance,
  useGetSignatures,
  useGetTokenAccounts,
  useRequestAirdrop,
  useTransferSol,
} from './account-data-access'

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address })

  return (
    <Box>
      <Title style={{ cursor: 'pointer' }} onClick={() => query.refetch()}>
        {query.data ? <BalanceSol balance={query.data} /> : '...'} SOL
      </Title>
    </Box>
  )
}
export function AccountChecker() {
  const { publicKey } = useWallet()
  if (!publicKey) {
    return null
  }
  return <AccountBalanceCheck address={publicKey} />
}
export function AccountBalanceCheck({ address }: { address: PublicKey }) {
  const { cluster } = useCluster()
  const mutation = useRequestAirdrop({ address })
  const query = useGetBalance({ address })

  if (query.isLoading) {
    return null
  }
  if (query.isError || !query.data) {
    return (
      <UiAlert
        refresh={() => mutation.mutateAsync(1).catch((err) => console.log(err))}
        refreshIcon={<IconParachute height={12} />}
        title={
          <span>
            You are connected to <strong>{cluster.name}</strong> but your account is not found on this cluster.
          </span>
        }
      />
    )
  }
  return null
}

export function AccountButtons({ address }: { address: PublicKey }) {
  const wallet = useWallet()
  const { cluster } = useCluster()
  const [showAirdropModal, setShowAirdropModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)

  return (
    <Group justify="center">
      <ModalAirdrop hide={() => setShowAirdropModal(false)} address={address} show={showAirdropModal} />
      <ModalReceive address={address} show={showReceiveModal} hide={() => setShowReceiveModal(false)} />
      <ModalSend address={address} show={showSendModal} hide={() => setShowSendModal(false)} />
      <Button.Group>
        <Button
          size="xs"
          variant="outline"
          disabled={cluster.network?.includes('mainnet')}
          onClick={() => {
            setShowAirdropModal(true)
          }}
        >
          Airdrop
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={wallet.publicKey?.toString() !== address.toString()}
          onClick={() => setShowSendModal(true)}
        >
          Send
        </Button>
        <Button size="xs" variant="outline" onClick={() => setShowReceiveModal(true)}>
          Receive
        </Button>
      </Button.Group>
    </Group>
  )
}

export function AccountTokens({ address }: { address: PublicKey }) {
  const [showAll, setShowAll] = useState(false)
  const query = useGetTokenAccounts({ address })
  const client = useQueryClient()
  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Token Accounts</Title>
        <Group>
          {query.isLoading ? (
            <Loader size="sm" />
          ) : (
            <ActionIcon
              variant="outline"
              onClick={async () => {
                await query.refetch()
                await client.invalidateQueries({
                  queryKey: ['getTokenAccountBalance'],
                })
              }}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
      {query.isError && <Alert color="red" title={`Error: ${query.error?.message.toString()}`} />}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <Alert title="No token accounts found." />
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Public Key</Table.Th>
                  <Table.Th>Mint</Table.Th>
                  <Table.Th ta="right">Balance</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <tbody>
                {items?.map(({ account, pubkey }) => (
                  <Table.Tr key={pubkey.toString()}>
                    <Table.Td>
                      <Text span ff="monospace">
                        <ExplorerLink label={ellipsify(pubkey.toString())} path={`account/${pubkey.toString()}`} />
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text span ff="monospace">
                        <ExplorerLink
                          label={ellipsify(account.data.parsed.info.mint)}
                          path={`account/${account.data.parsed.info.mint.toString()}`}
                        />
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text span ff="monospace">
                        {account.data.parsed.info.tokenAmount.uiAmount}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}

                {(query.data?.length ?? 0) > 5 && (
                  <Table.Tr>
                    <Table.Td colSpan={4} ta="center">
                      <Button size="xs" variant="outline" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show All'}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      )}
    </Stack>
  )
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address })
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Transaction History</Title>
        <Group>
          {query.isLoading ? (
            <Loader size="sm" />
          ) : (
            <ActionIcon variant="outline" onClick={() => query.refetch()}>
              <IconRefresh size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
      {query.isError && <Alert color="red" title={`Error: ${query.error?.message.toString()}`} />}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <Alert title="No transactions found." />
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Signature</Table.Th>
                  <Table.Th ta="right">Slot</Table.Th>
                  <Table.Th>Block Time</Table.Th>
                  <Table.Th ta="right">Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items?.map((item) => (
                  <Table.Tr key={item.signature}>
                    <Table.Th ff="monospace">
                      <ExplorerLink path={`tx/${item.signature}`} label={ellipsify(item.signature, 8)} />
                    </Table.Th>
                    <Table.Td ff="monospace" ta="right">
                      <ExplorerLink path={`block/${item.slot}`} label={item.slot.toString()} />
                    </Table.Td>
                    <Table.Td>{new Date((item.blockTime ?? 0) * 1000).toISOString()}</Table.Td>
                    <Table.Td ta="right">
                      {item.err ? (
                        <Badge color="red" size="xs" title={`Failed ${JSON.stringify(item.err)}`}>
                          Failed
                        </Badge>
                      ) : (
                        <Badge color="green" size="xs">
                          Success
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
                {(query.data?.length ?? 0) > 5 && (
                  <Table.Tr>
                    <Table.Td colSpan={4} ta="center">
                      <Button size="xs" variant="outline" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show All'}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          )}
        </div>
      )}
    </Stack>
  )
}

function BalanceSol({ balance }: { balance: number }) {
  return <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
}

function ModalReceive({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  return (
    <AppModal title="Receive" hide={hide} show={show}>
      <p>Receive assets by sending them to your public key:</p>
      <code>{address.toString()}</code>
    </AppModal>
  )
}

function ModalAirdrop({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  const mutation = useRequestAirdrop({ address })
  const [amount, setAmount] = useState('2')

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Airdrop"
      submitDisabled={!amount || mutation.isPending}
      submitLabel="Request Airdrop"
      submit={() => mutation.mutateAsync(parseFloat(amount)).then(() => hide())}
    >
      <TextInput
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  )
}

function ModalSend({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  const wallet = useWallet()
  const mutation = useTransferSol({ address })
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('1')

  if (!address || !wallet.sendTransaction) {
    return <div>Wallet not connected</div>
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Send"
      submitDisabled={!destination || !amount || mutation.isPending}
      submitLabel="Send"
      submit={() => {
        mutation
          .mutateAsync({
            destination: new PublicKey(destination),
            amount: parseFloat(amount),
          })
          .then(() => hide())
      }}
    >
      <TextInput
        disabled={mutation.isPending}
        type="text"
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <TextInput
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  )
}
