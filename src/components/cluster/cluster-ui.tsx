import { ActionIcon, Anchor, Button, Group, Menu, Select, Table, Text, TextInput } from '@mantine/core'
import { useConnection } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { IconTrash } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { AppModal, UiAlert } from '../ui/ui-layout'
import { ClusterNetwork, useCluster } from './cluster-data-access'

export function ExplorerLink({ path, label }: { path: string; label: string }) {
  const { getExplorerUrl } = useCluster()
  return (
    <Anchor href={getExplorerUrl(path)} target="_blank" rel="noopener noreferrer" ff="monospace">
      {label}
    </Anchor>
  )
}

export function ClusterChecker({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const { connection } = useConnection()

  const query = useQuery({
    queryKey: ['version', { cluster, endpoint: connection.rpcEndpoint }],
    queryFn: () => connection.getVersion(),
    retry: 1,
  })
  if (query.isLoading) {
    return null
  }
  if (query.isError || !query.data) {
    return (
      <UiAlert
        refresh={() => query.refetch()}
        title={
          <span>
            Error connecting to cluster <strong>{cluster.name}</strong>
          </span>
        }
      />
    )
  }
  return children
}

export function ClusterUiSelect() {
  const { clusters, setCluster, cluster } = useCluster()
  return (
    <div>
      <UiDropdown
        label={cluster.name}
        items={clusters.map((cluster) => {
          return {
            label: cluster.name,
            active: cluster.active,
            onClick: () => {
              setCluster(cluster)
            },
          }
        })}
      />
    </div>
  )
}

function UiDropdown({
  label,
  items,
}: {
  label: string
  items: { active?: boolean; label: string; onClick: () => void }[]
}) {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button>{label}</Button>
      </Menu.Target>

      <Menu.Dropdown>
        {items.map((item) => (
          <Menu.Item key={item.label} onClick={() => item.onClick()} disabled={item.active}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}

export function ClusterUiModal({ hideModal, show }: { hideModal: () => void; show: boolean }) {
  const { addCluster } = useCluster()
  const [name, setName] = useState('')
  const [network, setNetwork] = useState<ClusterNetwork | undefined>()
  const [endpoint, setEndpoint] = useState('')

  return (
    <AppModal
      title={'Add Cluster'}
      hide={hideModal}
      show={show}
      submit={() => {
        try {
          new Connection(endpoint)
          if (name) {
            addCluster({ name, network, endpoint })
            hideModal()
          } else {
            console.log('Invalid cluster name')
          }
        } catch {
          console.log('Invalid cluster endpoint')
        }
      }}
      submitLabel="Save"
    >
      <TextInput type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextInput type="text" placeholder="Endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
      <Select
        value={network}
        onChange={(e) => setNetwork(e as ClusterNetwork)}
        placeholder="Select a network"
        data={[
          { value: ClusterNetwork.Devnet, label: 'Devnet' },
          { value: ClusterNetwork.Testnet, label: 'Testnet' },
          { value: ClusterNetwork.Mainnet, label: 'Mainnet' },
        ]}
      />
    </AppModal>
  )
}

export function ClusterUiTable() {
  const { clusters, setCluster, deleteCluster } = useCluster()
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name/ Network / Endpoint</Table.Th>
          <Table.Th ta="center">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {clusters.map((item) => (
          <Table.Tr key={item.name}>
            <Table.Td>
              <Group wrap="nowrap">
                <Button disabled={item.active} title="Select cluster" variant="light" onClick={() => setCluster(item)}>
                  {item.name}
                </Button>
              </Group>
              <Text size="xs">Network: {item.network ?? 'custom'}</Text>
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                {item.endpoint}
              </Text>
            </Table.Td>
            <Table.Td ta="center">
              <ActionIcon
                disabled={item?.active}
                variant="outline"
                onClick={() => {
                  if (!window.confirm('Are you sure?')) return
                  deleteCluster(item)
                }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
