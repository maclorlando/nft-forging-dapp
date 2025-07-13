import {
  Button,
  Group,
  Card,
  Title,
  Text,
  Container,
  Tabs,
  Grid,
  Loader,
  Center,
  Badge,
  CopyButton,
  Tooltip,
  Modal,
  Select,
  useMantineTheme,
  Notification,
  Alert,
  Image,
  Anchor
} from "@mantine/core";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient } from "wagmi";
import { TOKENS, useContracts, FORGE_ADDRESS, CHAIN_ID, OPENSEA_COLLECTION_URL } from "../hooks/useContracts";
import { useEffect, useState } from "react";
import {
  IconX,
  IconCheck,
  IconCopy,
  IconCheck as IconCopied,
  IconSwords,
  IconFlame,
  IconRecycle,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useAllBalances } from "../hooks/useAllBalances";
import { parseTxError } from "../hooks/useErrorParser";
import { useMintCooldown } from "../hooks/useMintCooldown";

export default function Home() {
  const cooldown = useMintCooldown();
  const publicClient = usePublicClient();
  const { address, chain } = useAccount();
  const {
    mint,
    forge,
    trade,
    isApprovedForAll,
    setApprovalForAll,
  } = useContracts();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [loading, setLoading] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [approved, setApproved] = useState(false);
  const [tradeModal, setTradeModal] = useState({ open: false, tokenId: 0 });
  const [selectedBaseToken, setSelectedBaseToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<
    { title: string; message: string; color: string; icon: any; id: number }[]
  >([]);

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function safeRefetchBalances(retries = 3) {
    for (let i = 0; i < retries; i++) {
      await delay(1000);
      await refetchBalances();
    }
  }

  const addNotification = (title: string, message: string, color: string, icon: any) => {
    const id = Date.now();
    setNotifications((n) => [...n, { title, message, color, icon, id }]);
    setTimeout(() => removeNotification(id), 5000); // Auto close
  };

  const removeNotification = (id: number) => {
    setNotifications((n) => n.filter((notif) => notif.id !== id));
  };

  const checkApproval = async () => {
    if (!address) return;
    try {
      const result = await isApprovedForAll(address, FORGE_ADDRESS);
      setApproved(result as boolean);
    } catch (err) {
      console.error("Approval check failed", err);
    }
  };

  const [txPending, setTxPending] = useState(false);
  const { balances, refetchBalances } = useAllBalances();

  useEffect(() => {
    if (address) checkApproval();
  }, [address]);

  const handleTx = async (action: () => Promise<any>, successMsg: string, onSuccess?: () => void) => {
    setLoading(true);
    setTxPending(false);
    try {
      const tx = await action();
      if (tx?.hash) {
        setTxPending(true); // Set pending state
        await publicClient.waitForTransactionReceipt({ hash: tx.hash });
        setTxPending(false);
      }
      addNotification("Success", successMsg, "green", <IconCheck />);
      await checkApproval();
      await safeRefetchBalances();
    } catch (err: any) {
      const msg = parseTxError(err);
      if (msg.toLowerCase().includes("cooldown")) {
        addNotification("Cooldown", "You must wait 1 minute between free mints.", "orange", <IconAlertTriangle />);
      } else if (msg.toLowerCase().includes("approval")) {
        addNotification("Approval Required", "You need to approve the contract first.", "orange", <IconAlertTriangle />);
      } else if (msg.toLowerCase().includes("ingredients")) {
        addNotification("Not Enough Ingredients", "You don't have the required ingredients.", "orange", <IconAlertTriangle />);
      } else {
        addNotification("Error", msg, "red", <IconX />);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoadingApproval(true);
    try {
      const tx = await setApprovalForAll(FORGE_ADDRESS, true);
      // ⬇️ Wait for the chain to confirm
      await publicClient.waitForTransactionReceipt({ hash: tx });
      addNotification("Approved", "Forge contract approved!", "green", <IconCheck />);
      await checkApproval();
    } catch (err: any) {
      const msg =
        err?.shortMessage ||
        err?.cause?.message ||
        err?.message ||
        "Approval failed";
      addNotification("Error", msg, "red", <IconX />);
    } finally {
      setLoadingApproval(false);
    }
  };

  const getRecipe = (id: number) => {
    const recipes: Record<number, string> = {
      3: "Red Herb + Mysterious Solution",
      4: "Magic Dust + Mysterious Solution",
      5: "Red Herb + Magic Dust",
      6: "Red Herb + Magic Dust + Mysterious Solution",
    };
    return recipes[id] || "";
  };

  return (
    <Container
      fluid
      mt="md"
      style={{
        background: "radial-gradient(circle at top, #1f1f2e 0%, #0f0f1a 50%, #0a0a0a 100%)",
        minHeight: "100vh",
        padding: isMobile ? "1rem" : "2rem",
        overflowX: "hidden",
      }}
    >
      <Group justify="space-between" wrap="wrap">
        <Title order={isMobile ? 4 : 3} c="white">
          🧪 Magic Alchemy NFT Forging Game
        </Title>
        <ConnectButton />
      </Group>

      {chain?.id !== CHAIN_ID && address && (
        <Text mt="sm" c="orange" fw={700}>
          ⚠️ Please switch to Base Mainnet!
        </Text>
      )}

      {address && (
        <>
        <Group mt="sm" gap="xs" align="center">
              <Image
                src="images/alchemy-logo.jpeg"
                alt="Collection"
                width={50}
                height={50}
                radius="xl"
              />
              <Anchor
                href={OPENSEA_COLLECTION_URL}
                target="_blank"
                underline="hover"
                style={{ color: "white", fontSize: "14px" }}
              >
                View Collection on OpenSea
              </Anchor>
            </Group>
          <Card withBorder p="md" mt="md" bg="dark">
            <Group wrap="wrap">
              <CopyButton value={address} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy Address"}>
                    <Badge
                      color="gray"
                      onClick={copy}
                      style={{
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        padding: "0.5rem 0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                      leftSection={copied ? <IconCopied size={12} /> : <IconCopy size={12} />}
                    >
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </Badge>
                  </Tooltip>
                )}
              </CopyButton>
              <Group gap="xs" wrap="wrap">
                {TOKENS.map((token, i) => (
                  <Badge
                    key={token.id}
                    color="gray"
                    leftSection={<img src={`/images/${token.id}.jpeg`} width={16} />}
                  >
                    {token.name}: {balances[i] ?? 0}
                  </Badge>
                ))}
              </Group>
            </Group>
          </Card>
        </>
      )}

      <Title order={isMobile ? 5 : 4} mt="xl" c="white">
        Craft Your Potions
      </Title>
      <Tabs defaultValue="mint" mt="lg" color="blue" variant="pills">
        <Tabs.List grow>
          <Tabs.Tab
            value="mint"
            leftSection={<IconFlame size={14} />}
            style={{ color: "white", transition: "all 0.3s ease", background: "#111" }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(2)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            Free Mint
          </Tabs.Tab>
          <Tabs.Tab
            value="forge"
            leftSection={<IconSwords size={14} />}
            style={{ color: "white", transition: "all 0.3s ease", background: "#111" }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(2)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            Forge
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="mint" pt="md">
          {cooldown > 0 && (
            <Text c="orange" size="sm" mt="sm">
              🕒 Next Free Mint available in: {cooldown} seconds
            </Text>
          )}
          <Grid gutter={isMobile ? "sm" : "md"}>
            {TOKENS.filter((t) => t.id <= 2).map((token) => (
              <Grid.Col span={isMobile ? 12 : 4} key={token.id}>
                <Card
                  shadow="sm"
                  padding="md"
                  radius="md"
                  withBorder
                  bg="#222"
                  style={{ transition: "transform 0.2s", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Card.Section>
                    <img
                      src={`/images/${token.id}.jpeg`}
                      alt={token.name}
                      style={{ objectFit: "contain", maxHeight: 150, width: "100%" }}
                    />
                  </Card.Section>
                  <Text mt="sm" c="white" fw={700}>
                    {token.name}
                  </Text>
                  <Button
                    mt="md"
                    fullWidth
                    loading={loading}
                    onClick={() => handleTx(() => mint(token.id), `${token.name} minted!`)}
                  >
                    Mint {token.name}
                  </Button>
                  <Button
                    mt="sm"
                    variant="light"
                    fullWidth
                    loading={loading}
                    disabled={!address || !approved}
                    leftSection={<IconRecycle size={14} />}
                    onClick={() => setTradeModal({ open: true, tokenId: token.id })}
                  >
                    Trade This
                  </Button>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="forge" pt="md">
          {!approved && (
            <Alert
              icon={<IconAlertTriangle size={18} />}
              title="Approval Required"
              color="yellow"
              mt="md"
              style={{
                backgroundColor: "#2c2c1f",
                color: "orange",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "1.5rem",
              }}
            >
              <Text c="white" mb="sm">
                You need to approve the Forge Contract before you can Forge or Trade.
              </Text>
              <Button
                mt="sm"
                size="xs"
                loading={loadingApproval}
                onClick={handleApprove}
                style={{ marginTop: "12px" }}
              >
                Approve Contract
              </Button>
            </Alert>
          )}

          {approved && (
            <Alert
              icon={<IconCheck size={18} />}
              title="Forge Contract Approved"
              color="green"
              mt="md"
              style={{
                backgroundColor: "#1f2c1f",
                color: "green",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "1.5rem",
              }}
            >
              <Text c="white" mb="sm">
                You can now Forge or Trade!
              </Text>
            </Alert>
          )}

          <Grid gutter={isMobile ? "sm" : "md"}>
            {TOKENS.filter((t) => t.id >= 3).map((token) => (
              <Grid.Col span={isMobile ? 12 : 4} key={token.id}>
                <Card
                  shadow="sm"
                  padding="md"
                  radius="md"
                  withBorder
                  bg="#222"
                  style={{ transition: "transform 0.2s", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Card.Section>
                    <img
                      src={`/images/${token.id}.jpeg`}
                      alt={token.name}
                      style={{ objectFit: "contain", maxHeight: 150, width: "100%" }}
                    />
                  </Card.Section>
                  <Text mt="sm" c="white" fw={700}>
                    {token.name}
                  </Text>
                  <Text c="gray" size="sm">
                    Recipe: {getRecipe(token.id)}
                  </Text>
                  <Button
                    mt="md"
                    fullWidth
                    loading={loading}
                    disabled={!address || !approved}
                    onClick={() => handleTx(() => forge(token.id), `${token.name} forged!`)}
                  >
                    {txPending ? "Waiting Confirmation..." : `Forge ${token.name}`}
                  </Button>
                  <Button
                    mt="sm"
                    variant="light"
                    fullWidth
                    loading={loading}
                    disabled={!address || !approved}
                    leftSection={<IconRecycle size={14} />}
                    onClick={() => setTradeModal({ open: true, tokenId: token.id })}
                  >
                    Trade This
                  </Button>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={tradeModal.open}
        onClose={() => setTradeModal({ open: false, tokenId: 0 })}
        title="Trade Token"
        centered
      >
        <Select
          label="Select Base Token to receive"
          placeholder="Choose one"
          data={TOKENS.filter((t) => t.id <= 2 && t.id !== tradeModal.tokenId).map((t) => ({ value: t.id.toString(), label: t.name }))}
          value={selectedBaseToken}
          onChange={setSelectedBaseToken}
        />
        <Button
          fullWidth
          mt="md"
          loading={loading}
          disabled={!selectedBaseToken}
          onClick={() =>
            handleTx(() => trade(tradeModal.tokenId, Number(selectedBaseToken)), "Trade completed!").then(() => {
              setTradeModal({ open: false, tokenId: 0 });
              setSelectedBaseToken(null);
            })
          }
        >
          {txPending ? "Waiting Confirmation..." : `Confirm Trade`}
        </Button>
      </Modal>

      {/* Notifications */}
      <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 9999 }}>
        {notifications.map((n) => (
          <Notification
            key={n.id}
            title={n.title}
            color={n.color}
            icon={n.icon}
            withCloseButton
            onClose={() => removeNotification(n.id)}
            mt="sm"
          >
            {n.message}
          </Notification>
        ))}
      </div>

      <Center mt="xl" mb="md">
        <Text c="gray" size="xs">
          🧪 Magic Alchemy NFT Forging Game — Built with Mantine, RainbowKit & Wagmi
        </Text>
      </Center>
    </Container>
  );
}
