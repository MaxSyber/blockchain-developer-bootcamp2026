async function main() {
  console.log(`Preparing deployment...\n`)
  //fetch contract to deploy
  const Token = await ethers.getContractFactory("Token")

  //deploy token
  const token= await Token.deploy('Dah', 'DAH', '1000000')
  await token.deployed()
  console.log(`Token Deployed to: ${token.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });