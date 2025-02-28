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
    "0x4314E2AeFB0f48B66F1F30A811d99b7460a665D0",
    "0x40B941861A6D95F518C689b09E2eee8Bc619cbA4",
    "0x664bD284a16B9d968522838D5e1d37CdFFdcfDBe",
    "0xecAd7792C24eA927ec8a5fE9eE183639D2F067ae",
    "0x6f71E1D3fb1bCC5766Aa489f43c2e7d67d17f981",
    "0xFa5f9bd427Ad2Df523Bb78Cbd7eF330cC7BE340d",
    "0x85644513CdDC95a8F64c59a2Ddfdc19f792107A9",
    "0x193B92fb0f3cac8B9A11C44233b2C7e07c3F6b9b",
    "0x50504d1A61376CEB01Bf1A3E685EfB8a0D9A805e",
    "0x17f0F264A6AAA007db3E8a47a092390ad8124A0b",
    "0x93097E6F4CE472E70bc2831C7682ECbE7f078eD5",
    "0x9ee0E8d9e29a1793a45B607F4430103dd42C835A",
    "0x81a37297249c27C2Ac234019aCd9a45aF11d5064",
    "0x2EdC0E1bC8aD343bD27539c71547e54bD360C267",
    "0xEd18F18831e9D35df2952c4f157eC9aCfad6a10B",
    "0xF586a4d9a65B4986443090B3E3122f1dBeC11dd3",
    "0xCCAa1Fcc179ba166D79Aa2284ed916cBE48e068A",
    "0x172047a0a7035126ab29aC30D3BEAE1b6b619cb9",
    "0x99bf1b453999D276D868f49475eCDb136f3819b1",
    "0xe72058AA227F251b9c8EA41c0C254dB1aDA82510",
    "0xeF67DC05d066f1497992480b3C88eDd2E6cA3149",
    "0x1f11695A42d76Ed43B6bc1420B9CF0c6a674da86",
    "0x2ECD6C12F06e9d58c8c71686c0fBC33685E5329E",
    "0xa0e88381A9a055a54389D0A6ae587057D171a3c5",
    "0xe1426A5C124b2e5a4de66813B9B3A7A2cbc4c989",
    "0x0eBdAC160966dD487C984c1fD31890E94b3898d8",
    "0x21E57DC6A5964B1b7c7EB6FF185c6910d7711eb2",
    "0xD9165a6dbE6844EBAe0C2F38E9F3D6C0bA873837",
    "0xe33F11057E036ebc73c4938f1853C97C3979356C",
    "0x9A181E3178E59124fa1d4E7BefDa33dF5A5E7aAF",
    "0xB3Da0cFE42AE4e63E12efBd714B9c529BF4C1fE0",
    "0xD8816aaaF548794C9FBC898D5028Fb68C6F10dAc",
    "0x1Cf396eca986590cC9aCA305483d396749Ea36e8",
    "0x88201D8151EfBa2092523CE4d76d60036c7718bF",
    "0xf5f34123Fe8762eF1a099d1ACc24da049D08f5FD",
    "0x4e3aA6092cD50DdaFcB3e091990EDE029F18653B",
    "0x30b404Ee65Fc462db150D924DB1372a7FA7e999d",
    "0x532bA976C9FDE21358E74D54b0e0a205E979eC52",
    "0x252613Ecf3232dEe2c7d366EC404A5922619Ad8E",
    "0x45e092142CE651d42778f0008D1D03e41194CD6f",
    "0xC380AC0D8Cd8f1e4056EB4c72ADd2ad53c911d1F",
    "0x9C81797304068FE0668c552Bc7563Ec2cc6DCa81",
    "0x646D1fC83084602f76228d5dEafB00268895ee3b",
    "0x88812b4F3a593bCB6FaEe35fEa189af677D6D00d",
    "0x21baF2600D334FA175EB0b229f9dF3Da1f30Bc56",
    "0x33f7e18226b99Ab05faf6b995bFa3d31EEA48fe5",
    "0xa7A3D97ce9FB6fcD6056bE66E5C180A17E04611A",
    "0x57bed5B4fBCE543916530746CFC7d170b871eaD6",
    "0x9Ebec2CaE5d6BC4c463423e0AE3860929BE9b5aE",
    "0xD9A16312980216F640Ed3cAaC37c46Ca7ce1166a",
    "0x8883e113356CE8c236034b31Cab18C5656224B63",
    "0xCBFeA1A879FC0f228c0aB4F2047CbD8178148CB2",
    "0x6e187801FC02fb92b41412FaC26066305f35109b",
    "0x51D2bF026Fde1Ce087c178d9cE3F91FdEbF054E6",
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
