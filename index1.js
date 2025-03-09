const { ethers } = require("ethers");

// Configuración
const RPC_URL = "https://blast-rpc.publicnode.com";
const FLASHLOAN_CONTRACT_ADDRESS = "0xe7022aFf91f3156d67c05936604986a30a87fE01";
const COMPTROLLER_ADDRESS = "0x02B7BF59e034529d90e2ae8F8d1699376Dd05ade";
const ACCOUNT_ADDRESSES = [
    "0x9A6977E53119EeF0a91f9ca4488AA973d617a327",
    "0xDeef48D15099D54c352ce734556c453D6B99E078",
    "0x979f8A606ed7CEC924375279B319946A0E6f9cc9",
    "0x8e2761970Ab5cF355611Ea0Fcfc904318B855D2f",
    "0x77d5654CF9fE5Bd046147cB78E4280b7FB099d00",
    "0x8b6495aa123FDec9c9929f11bBc5239713f319e2",
    "0xE2808Fa3Cf07FcB9305142e153a1ec0E653291F2"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

// ABI del Comptroller
const comptrollerAbi = [
    {
        "name": "isUserLiquidatable",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function",
        "inputs": [{ "internalType": "address", "name": "borrower", "type": "address" }]
    }
];

const comptroller = new ethers.Contract(COMPTROLLER_ADDRESS, comptrollerAbi, provider);

// ABI del contrato Flashloan
const flashloanAbi = [
    {
        "name": "executeLiquidation",
        "type": "function",
        "stateMutability": "nonpayable",
        "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
        "outputs": []
    }
];

const flashloanContract = new ethers.Contract(FLASHLOAN_CONTRACT_ADDRESS, flashloanAbi, wallet);

// Función para obtener y mostrar el estado de cuentas liquidables
async function checkAndLiquidateAccounts() {
    for (const account of ACCOUNT_ADDRESSES) {
        try {
            const isLiquidatable = await comptroller.isUserLiquidatable(account);
            
            if (isLiquidatable) {
                console.log(`[✅] ${account} es LIQUIDABLE. Ejecutando liquidación...`);
                await liquidateAccount(account);
            } else {
                console.log(`[❌] ${account} NO es liquidable.`);
            }
        } catch (err) {
            console.error(`Error verificando cuenta ${account}:`, err);
        }
    }
}

// Función para ejecutar la liquidación
async function liquidateAccount(account) {
    try {
        const tx = await flashloanContract.executeLiquidation(account);
        console.log(`🔵 Liquidación enviada para ${account}, TX: ${tx.hash}`);
        await tx.wait();
        console.log(`✅ Liquidación confirmada para ${account}`);
    } catch (err) {
        console.error(`❌ Error liquidando a ${account}:`, err);
    }
}

// Bucle infinito para monitorear y liquidar
async function monitorAndLiquidate() {
    console.log("🚀 Monitoreo iniciado...");

    while (true) {
        await checkAndLiquidateAccounts();
        
        // Espera 5 segundos antes de volver a chequear
        console.log("🔄 Esperando 5 segundos para la siguiente revisión...\n");
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

monitorAndLiquidate();
