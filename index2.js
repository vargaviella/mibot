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
    "0x7A9e966f59cad035632c464Cb02C2B75e87CDD7a",
    "0xc6CE9CCFe962c6a97d864cA6A05032F6460e3552",
    "0x3f8E2Ae8ab8797B48412831fcee940CA2d511073",
    "0x72981f10573cc20D4bB9D1909Bd9a5B5a5e20255",
    "0x6F4Fa4581e5096A3EAe211Cf16F14018927034fB",
    "0xa0e88381A9a055a54389D0A6ae587057D171a3c5",
    "0xe1426A5C124b2e5a4de66813B9B3A7A2cbc4c989",
    "0x21E57DC6A5964B1b7c7EB6FF185c6910d7711eb2",
    "0xe33F11057E036ebc73c4938f1853C97C3979356C",
    "0xD8816aaaF548794C9FBC898D5028Fb68C6F10dAc",
    "0xdbAeE7B46D722c196Db44fAAA355874E935F83Db",
    "0x88812b4F3a593bCB6FaEe35fEa189af677D6D00d",
    "0xaFb9d7Fa614DD77CD9D212bb0596982c850A5085",
    "0x8883e113356CE8c236034b31Cab18C5656224B63",
    "0xCBFeA1A879FC0f228c0aB4F2047CbD8178148CB2",
    "0x158fe15aF625B86752667827A5F71CbFf04f3167",
    "0x172456A44FB7f5DF8fdB628Ce35aD3DA3816855E",
    "0x8A7EA8BF5D72037b151DF18dBE180B345917e2eD",
    "0x310aa04324b564Fb1178C92C1E7d1DC14C51669d"
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
