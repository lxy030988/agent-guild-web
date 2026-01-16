const hre = require("hardhat");

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   Deploying LiquidStaking with Dynamic APY                 ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // 1. 部署 Mock USDC
  console.log("1. Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log(`   ✓ MockUSDC: ${usdcAddress}`);

  // 2. 部署 LiquidStakingWithDynamicAPY
  console.log("\n2. Deploying LiquidStakingWithDynamicAPY...");
  const [deployer] = await hre.ethers.getSigners();
  console.log(`   ✓ Deployer: ${deployer.address}`);

  // 初始APY：8.5% (8.5e16 in 18 decimal precision)
  const initialAPY = hre.ethers.parseUnits("0.085", 18); // 8.5%

  const LiquidStaking = await hre.ethers.getContractFactory("LiquidStakingWithDynamicAPY");
  const liquidStaking = await LiquidStaking.deploy(usdcAddress, initialAPY, deployer.address);
  await liquidStaking.waitForDeployment();
  const stakingAddress = await liquidStaking.getAddress();
  console.log(`   ✓ LiquidStaking: ${stakingAddress}`);

  // 3. 获取stUSDC地址
  const stUsdcAddress = await liquidStaking.receiptToken();
  console.log(`   ✓ stUSDC: ${stUsdcAddress}`);

  // 4. 铸造USDC给测试账户
  console.log("\n3. Minting USDC for testing...");
  const mintAmount = hre.ethers.parseUnits("100000", 6);
  await mockUSDC.mint(deployer.address, mintAmount);
  console.log(`   ✓ Minted ${hre.ethers.formatUnits(mintAmount, 6)} USDC to ${deployer.address}`);

  // 5. 授权
  console.log("\n4. Approving USDC...");
  await mockUSDC.approve(stakingAddress, mintAmount);
  console.log(`   ✓ Approved ${hre.ethers.formatUnits(mintAmount, 6)} USDC`);

  // 6. Deployer 先质押一部分（建立初始流动性）
  console.log("\n5. Initial staking (providing liquidity)...");
  const initialStake = hre.ethers.parseUnits("50000", 6);
  const txStake = await liquidStaking.stake(initialStake);
  await txStake.wait();
  const stUsdc = await hre.ethers.getContractAt("ERC20", stUsdcAddress);
  const stUsdcBalance = await stUsdc.balanceOf(deployer.address);
  console.log(`   ✓ Staked ${hre.ethers.formatUnits(initialStake, 6)} USDC`);
  console.log(`   ✓ Received ${hre.ethers.formatUnits(stUsdcBalance, 6)} stUSDC`);

  // 7. 添加初始奖励到池子
  console.log("\n6. Adding initial rewards to pool...");
  const rewardAmount = hre.ethers.parseUnits("5000", 6);
  await liquidStaking.addRewards(rewardAmount);
  console.log(`   ✓ Added ${hre.ethers.formatUnits(rewardAmount, 6)} USDC to rewards pool`);

  // 8. 验证合约状态
  console.log("\n7. Verifying contract state...");
  const contractUSDCBalance = await mockUSDC.balanceOf(stakingAddress);
  const totalStaked = await liquidStaking.totalAssets();
  const pendingRewards = await liquidStaking.getPendingRewards();
  console.log(`   ✓ Contract USDC balance: ${hre.ethers.formatUnits(contractUSDCBalance, 6)} USDC`);
  console.log(`   ✓ Total staked: ${hre.ethers.formatUnits(totalStaked, 6)} USDC`);
  console.log(`   ✓ Pending rewards: ${hre.ethers.formatUnits(pendingRewards, 6)} USDC`);

  // 9. 检查用户可领取奖励
  console.log("\n8. Checking user rewards...");
  const userRewards = await liquidStaking.getClaimableRewards(deployer.address);
  console.log(`   ✓ User claimable rewards: ${hre.ethers.formatUnits(userRewards, 6)} USDC`);

  // 10. 打印汇率和APY
  const exchangeRate = await liquidStaking.getExchangeRate();
  const apy = await liquidStaking.getCurrentAPYPercent();
  console.log(`   ✓ Exchange Rate: ${hre.ethers.formatUnits(exchangeRate, 18)} USDC per stUSDC`);
  console.log(`   ✓ Current APY: ${hre.ethers.formatUnits(apy, 0)}%`);

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║   Deployment Complete!                                    ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  console.log("📝 Configuration:");
  console.log(`   USDC: "${usdcAddress}"`);
  console.log(`   LiquidStaking: "${stakingAddress}"`);
  console.log(`   stUSDC: "${stUsdcAddress}"`);
  console.log(`   Initial APY: 8.5%`);
  
  console.log("\n🚀 Testing Dynamic APY...");
  console.log("   (Simulating validator rewards by adding rewards)\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
