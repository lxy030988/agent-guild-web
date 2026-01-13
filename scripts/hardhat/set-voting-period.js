const { network, ethers } = require("hardhat");

async function main() {
  const drAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  console.log("--- Setting Global Voting Period ---");
  
  try {
    const dr = await ethers.getContractAt("DisputeResolution", drAddress);
    const tx = await dr.setVotingPeriod(60);
    await tx.wait();
    console.log("✅ Contract VotingPeriod set to 60 seconds (1 minute) for new disputes.");
  } catch (error) {
    console.warn("⚠️  Failed to set voting period:", error.message);
  }

  const period = await (await ethers.getContractAt("DisputeResolution", drAddress)).votingPeriod();
  console.log(`Current Global Voting Period: ${period.toString()} seconds`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
