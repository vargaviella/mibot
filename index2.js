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
const flashLoanContractAddress = "0x4875bBc0D2E0654434653b0F9aaE840D3E3A4137"; // Dirección de tu contrato
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
    "0x4086995B69BDB938EC6dd526a384c3ca7c2056b4",
    "0x6e187801FC02fb92b41412FaC26066305f35109b",
    "0x6915Fc3CF4a1E5836Ab5FD83a1a15d61b6EA4D2c",
    "0x8F5915A19Eb2Ba78Bc90aD0317d9ed0d161CBfeC",
    "0x33f7e18226b99Ab05faf6b995bFa3d31EEA48fe5",
    "0x09fa85D29AD0b2BfF76DAb327d8E52c03a4EA2De",
    "0x14379410a0cda0d8284c66a57EBDb5b233d3bCF4",
    "0x7127bD9ec36d48960fF514959B4e3cA011b9857F",
    "0x2D093Ee3Bd1AD5C1a867437e158be19bb952aB3F",
    "0x28eAd95628610B4eE91408cFE1C225c71AB6e7A8",
    "0x2FB26A137D1a36129f8eF3b3731074e9A919D222",
    "0xDCBa3fD8FB492aAc5f6a51caC2905410fe8bc87B",
    "0x8883e113356CE8c236034b31Cab18C5656224B63",
    "0xCBFeA1A879FC0f228c0aB4F2047CbD8178148CB2",
    "0x4363f24EAc8B5f989Aa2b43d702bb4936E510e7c",
    "0x487c6480C33f32435F99cFa4b1E09C0D4e4165f7",
    "0x51D2bF026Fde1Ce087c178d9cE3F91FdEbF054E6",
    "0x7191C43c199A3863cb023adaF014b8621061BEe7",
    "0xc4ECC4c4b3E0E384Ccb7a8A4b2f8cEBf519F27c2",
    "0x771C4150bc2bfE4df9632513C2948C2754911a4d",
    "0x5c798442561dD442B3A66dd0f7d0d87B24386c63",
    "0xfcACd4E8601e34242509Df946d8b11A3A6ad1b0b",
    "0xC4D34fE1f45D5E70Dec1f476Be45279A1cB49Fd9",
    "0x449AC5E40C8203BA389159a6F66e0f1fa137C5F6",
    "0x76C743184eD8F8b07762f1Af98B1EdaD953cdE6c",
    "0xD7AE5DE2f4373b6eF31D1C18096629cBfa6fdA47",
    "0x16C5183caDc222D1bc172793962DD73E950DacD2",
    "0xC3fAC1E2D80Fa7524731697B03f319104E0D3831",
    "0x2de4786ED510a6b012187750cF3119083DE4680A",
    "0x9C81797304068FE0668c552Bc7563Ec2cc6DCa81"
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
