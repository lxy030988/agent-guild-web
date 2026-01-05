// Setup file for Jest tests
// Mock wagmi hooks for testing without blockchain interaction

// Mock wagmi hooks
const mockUseAccount = {
  address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  isConnected: false,
  chain: undefined
};

const mockUseConnect = {
  connect: jest.fn(),
  connectors: []
};

const mockUseDisconnect = {
  disconnect: jest.fn()
};

const mockUseSwitchChain = {
  switchChain: jest.fn()
};

const mockUseBalance = {
  data: undefined
};

const mockUseEnsName = {
  data: undefined
};

const mockUseEnsAvatar = {
  data: undefined
};

const mockUseWriteContract = {
  writeContract: jest.fn(),
  isPending: false,
  data: undefined
};

const mockUseWaitForTransactionReceipt = {
  isLoading: false,
  isSuccess: false
};

const mockUseReadContract = {
  data: undefined,
  refetch: jest.fn()
};

const mockUseWatchContractEvent = jest.fn();
const mockUsePublicClient = jest.fn(() => null);

// Mock wagmi module
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => mockUseAccount),
  useConnect: jest.fn(() => mockUseConnect),
  useDisconnect: jest.fn(() => mockUseDisconnect),
  useSwitchChain: jest.fn(() => mockUseSwitchChain),
  useBalance: jest.fn(() => mockUseBalance),
  useEnsName: jest.fn(() => mockUseEnsName),
  useEnsAvatar: jest.fn(() => mockUseEnsAvatar),
  useWriteContract: jest.fn(() => mockUseWriteContract),
  useWaitForTransactionReceipt: jest.fn(() => mockUseWaitForTransactionReceipt),
  useReadContract: jest.fn(() => mockUseReadContract),
  useWatchContractEvent: jest.fn(() => mockUseWatchContractEvent),
  usePublicClient: jest.fn(() => mockUsePublicClient),
}));

// Mock wagmi/chains
jest.mock('wagmi/chains', () => ({
  sepolia: { id: 11155111, name: 'Sepolia' },
  mainnet: { id: 1, name: 'Ethereum' }
}));

// Mock wagmi/connectors
jest.mock('wagmi/connectors', () => ({
  injected: jest.fn(() => ({ id: 'injected', name: 'Injected' }))
}));

// Export mocks for use in tests
export {
    mockUseAccount, mockUseBalance, mockUseConnect,
    mockUseDisconnect, mockUseEnsAvatar, mockUseEnsName, mockUsePublicClient, mockUseReadContract, mockUseSwitchChain, mockUseWaitForTransactionReceipt, mockUseWatchContractEvent, mockUseWriteContract
};

