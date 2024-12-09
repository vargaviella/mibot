const { ethers } = require("ethers");
const { NonceManager } = ethers;

// Configuración del proveedor y contrato de Aave en Base Mainnet
const provider = new ethers.JsonRpcProvider("https://blast.gateway.tenderly.co/5yGcUWjtMCxxz5YoLUD0sH");

// Dirección y ABI del Aave LendingPool en Base
const aaveLendingPoolAddress = "0xa70B0F3C2470AbBE104BdB3F3aaa9C7C54BEA7A8"; // Dirección de Aave
const lendingPoolAbi = [
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserAccountData",
    "outputs": [
      { "internalType": "uint256", "name": "totalCollateralBase", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDebtBase", "type": "uint256" },
      { "internalType": "uint256", "name": "availableBorrowsBase", "type": "uint256" },
      { "internalType": "uint256", "name": "currentLiquidationThreshold", "type": "uint256" },
      { "internalType": "uint256", "name": "ltv", "type": "uint256" },
      { "internalType": "uint256", "name": "healthFactor", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Instancia del contrato de Aave LendingPool
const lendingPool = new ethers.Contract(aaveLendingPoolAddress, lendingPoolAbi, provider);

// Configuración de la wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const signer = new NonceManager(wallet.connect(provider));

// Dirección y ABI del contrato FlashLoan
const flashLoanContractAddress = "0xb177CfCbAc6EF5353CB5aFaa9C5A8B9Ce6700E52"; // Dirección de tu contrato
const flashLoanContractAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
    ],
    "name": "callattack",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Crear la instancia del contrato de flashloan
const flashLoanContract = new ethers.Contract(flashLoanContractAddress, flashLoanContractAbi, signer);

const userAddresses = [
  "0x0F6e98A756A40dD050dC78959f45559F98d3289d",
  "0xf6c9f3062D0d7Bb4E99228aA6030df929219BaC3",
  "0xE51748456ea9759C19D232A32F96bA3c1C110776",
  "0xafd94316995Bd0dc8B6c54f7794bC36961904e72",
  "0x6Fc993bE4FAF3d30517B00679389fE76dC8187d6",
  "0x193B92fb0f3cac8B9A11C44233b2C7e07c3F6b9b",
  "0x9D45d92D4F4850fd91C70D97ee9c2A9B4b151d1A",
  "0xa1B04dd16ad6b29b3f151e0A04944A070f5d0DD2",
  "0x0A46dbbbE111EFCB20C3C4a375c87e5f9Fa4CC8d",
  "0xcaee487a37B6565892cBcC7CE1e9D0ecAB31396a",
  "0x78fBd92bDed9383eDb78c6f403F8bF0b8BF883A8",
  "0xa98797D52344DB92D004B980F08e0d4eFA04fc20",
  "0x0d0A72BBB6710F540B93bb8Ad8E2cBf203515c53",
  "0xbb176a3Ef8e7213f92E1011A6BC96d45662A0104",
  "0x9FDaC23e9bcF2b577eA2BAaDC316ecb6619d4450",
  "0x2b5F543Dfff77eAFA203370663002c9C85165253"
];

async function monitorHealthFactor(userAddress) {
  try {
    const data = await lendingPool.getUserAccountData(userAddress);
    const healthFactor = ethers.formatUnits(data.healthFactor, 18);

    console.log(`Health Factor actual para ${userAddress}: ${healthFactor}`);
    if (parseFloat(healthFactor) < 1) {
      console.log(`HF < 1. Ejecutando flashloan para ${userAddress}...`);
      await executeLoan(userAddress);
    }
  } catch (error) {
    console.error(`Error al obtener datos para la dirección ${userAddress}:`, error);
  }
}

async function executeLoan(userAddress) {
  try {
    // Obtener las tarifas de gas
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.utils.parseUnits("0.0001", "gwei"); // Default a 20 Gwei si no hay gasPrice

    // Ejecutar el flashloan
    const tx = await flashLoanContract.callattack(userAddress, {
      gasLimit: 1923072, // Ajusta según el contrato
      gasPrice: gasPrice
    });

    console.log(`Transacción enviada: ${tx.hash}`);
    await tx.wait();
    console.log(`Flashloan ejecutado exitosamente para ${userAddress}`);
  } catch (error) {
    console.error(`Error al ejecutar el flashloan para ${userAddress}:`, error);
  }
}

async function monitorMultipleAddresses() {
  while (true) {
    try {
      for (let userAddress of userAddresses) {
        await monitorHealthFactor(userAddress);
      }
    } catch (error) {
      console.error("Error en el monitoreo:", error);
    }
  }
}

// Iniciar el monitoreo continuo
(async () => {
  await monitorMultipleAddresses();  // Inicia el monitoreo
})();
