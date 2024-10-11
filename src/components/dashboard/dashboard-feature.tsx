import { Anchor, Box, Stack, Text } from '@mantine/core'
import { AppHero } from '../ui/ui-layout'

const links: { label: string; href: string }[] = [
  { label: 'Solana Docs', href: 'https://docs.solana.com/' },
  { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
  { label: 'Solana Cookbook', href: 'https://solanacookbook.com/' },
  { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
  { label: 'Solana Developers GitHub', href: 'https://github.com/solana-developers/' },
]

export default function DashboardFeature() {
  return (
    <div>
      <AppHero title="gm" subtitle="Say hi to your new Solana dApp." />
      <Box ta="center">
        <Stack gap="xs">
          <Text>Here are some helpful links to get you started.</Text>
          {links.map((link, index) => (
            <div key={index}>
              <Anchor href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </Anchor>
            </div>
          ))}
        </Stack>
      </Box>
    </div>
  )
}
