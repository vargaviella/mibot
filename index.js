const { ethers } = require("ethers");
const { NonceManager } = ethers;

// Configuración del proveedor y contrato de Aave en Base Mainnet
const provider = new ethers.JsonRpcProvider("https://blast.gateway.tenderly.co/384uS3OltMQ1G1UaLzqBUx");

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
  "0xB63CB9BacbC3b654cEFb1CB4F3FEab5072fBdCD5",
  "0x3ed7C0Fb55A6185ef28D4e9bcaa96f8F3B2D0A01",
  "0x9b1C575cbB90c13052215F9d5c3eF6AdD037da13",
  "0xd5D8a2d27Fe0C337849f09CBaD76fF7106d5A5Eb",
  "0xCF4035f679dB2B35B26384399e7418182fc7FC41",
  "0x564d5AEEb2CdE5Ecd16dA4C0398C3937441359b4",
  "0x3935320debB34a2aB731615520F59057d2FdE64D",
  "0x9B1cEE3C4cF6255C30c80218dd86262FE94DF97B",
  "0x78527Fd0c67da150e9D84A27A07628341835a475",
  "0x9589Fab9Aeff4a4680F03bcf638da80995A3c23E",
  "0xcaee487a37B6565892cBcC7CE1e9D0ecAB31396a",
  "0x7dD04D4323145C2C1B52b8a266F495C5d9773511",
  "0x754a26B703868c5082596f52781B6b194300b1B4",
  "0xEA8435C693D5E1a93288E017162E0d615a8D0291",
  "0xB4705da23422ac70fa3ee84709151f41666F61c8",
  "0x5c213Bd6d5B4AAee29deec33b65c57a5ba85fE41",
  "0x267DC343deB9A1677e9e929727a5b8CF3a83A0Ca",
  "0x2C2Fa8A0B0Aa01169D1F7e2Dc70829572C263d58",
  "0x2316955E5340ed97D45d43Da6BA69604C0C3d030",
  "0x6eb036b5e8013bEe6439C3cAfeAFD6595BE222C2",
  "0xafd94316995Bd0dc8B6c54f7794bC36961904e72",
  "0x8F5915A19Eb2Ba78Bc90aD0317d9ed0d161CBfeC",
  "0x193B92fb0f3cac8B9A11C44233b2C7e07c3F6b9b",
  "0x037922317eEd2a5272fFa76595e933a07526493A",
  "0x8ad557E25766C99e28E6Fe8e3e0FBf87e452B23D",
  "0x9084ac2ad37C6Dc9B01691e45849b27Eb0455bf4",
  "0xbb9Bb4E64431001F314C43df4884189834229255",
  "0xeb6217D4B7b2911A1f0Ba8BC7D926aFaFB0c93b2",
  "0x9851B9997E5C944EC4E5Aedd2900D54C2a2D0d33",
  "0x9FDaC23e9bcF2b577eA2BAaDC316ecb6619d4450",
  "0xA6529Ba2cfBA4Fa47f41F887728Ad10Cd00E0b98",
  "0xd61Cb4E035837B388941c58F83F0FfE0bdC141e8",
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
    const gasPrice = feeData.gasPrice || ethers.utils.parseUnits("0.001", "gwei"); // Default a 20 Gwei si no hay gasPrice

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
