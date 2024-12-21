const { ethers } = require("ethers");
const { NonceManager } = ethers;

// Configuración del proveedor y contrato de Aave en Base Mainnet
const provider = new ethers.JsonRpcProvider("https://blast-mainnet.g.alchemy.com/v2/b6oJemkCmlgEGq1lXC5uTXwOHZA14WNP");

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
  "0x696c9b7Dd5fcAdbFa0B1170BeE6517e87598DcdB",
  "0xc33255d608a94713d5e5A53AA4843931a2d2Ee79",
  "0x33020Db041980Cef52f469b3B73286e1813f7F29",
  "0xD3fdC98D610349f5C94D9C341D878403721C7D34",
  "0xfCbbae9BE6Be2B6de264643Dd0Ee3d9a0E2e8733",
  "0xbD16C73a08544d916e53Ad1ba342f08d23994776",
  "0x124101EEcc8c3cA3F8aC8DC99cEb2ce6F70dbb87",
  "0x21dA8E4373A1e0f403F64B142Aa0DD6260315AB7",
  "0xee1D6A47208527858769980D3d932Ca897705cA2"
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
