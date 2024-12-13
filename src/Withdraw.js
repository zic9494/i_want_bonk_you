import { Keypair,Transaction,SystemProgram,PublicKey } from '@solana/web3.js';
import { provider ,connection } from './deposit.js';
import { createTransferInstruction } from '@solana/spl-token';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor'; 
import idl from '../idl/idl.json' assert { type: 'json' }; // 您的 IDL 檔案
import BN from 'bn.js';
import { deserialize , Schema } from "borsh";
import { Buffer } from 'buffer';
import bs58 from 'bs58';



const programId = new PublicKey('EiSSSmeYvZUPSCHwQgHY27hN6WjjDQTaGXvEvX37KX8F');
const base58SecretKey = "ng4LZxjMi8wfwii2YGMApVfQDQGw3M2knKu83qqcoukK2bp53AtKe6KZ2K2DSh4Xn9uzV9ZHJywFrMMojRztHvi";
const TokenprogramID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const mintPublicKey = new PublicKey('GGmKGGs29t8k3WEpFJkWrsLLymHzbC8CSEAXyjUfGcEM')

// 加載密鑰對
function loadKeypairFromJson() {
    try {
        const secretKey = bs58.decode(base58SecretKey);
        return Keypair.fromSecretKey(secretKey);
    } catch (error) {
        console.error('載入 Keypair 時發生錯誤:', error);
        throw error;
    }
}

// 初始化
const adminKeypair = loadKeypairFromJson();
const adminPubKey = adminKeypair.publicKey;
console.log('Admin Public Key:', adminPubKey.toBase58());

const program = new Program(idl, programId, provider);

/**
 * 提取資產（SOL 或特定代幣）
 * @param {string} type - 提取類型（'SOL' 或 'TOKEN'）
 * @param {number} amount - 提取數量
 */
export async function withdraw(type, amount) {
    try {
        const walletPK = adminPubKey; // 使用 admin 的公鑰作為測試輸入

        // 計算 User PDA
        const [userPda, userBump] = await PublicKey.findProgramAddress(
            [Buffer.from('solana'), walletPK.toBuffer()],
            programId
        );

        console.log("User PDA (Admin Test):", userPda.toBase58());

        let transaction;

        if (type === 'SOL') {
            // 提取 SOL 的交易指令
            const ix = await program.methods
                .withdrawSol(new BN(amount))
                .accounts({
                    signer: walletPK,
                    userPda: userPda,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();

            transaction = new Transaction().add(ix);
        } 

            // 查找用戶的代幣帳戶
            const userTokenAccount = await connection.getParsedTokenAccountsByOwner(walletPK,{
                    mint:mintPublicKey //filter
                });
                
                
            console.log("User Token Account (Admin Test):", userTokenAccount.value[0].pubkey.toBase58());

            // PDA 的代幣帳戶
            const [pdaTokenAccount] = await PublicKey.findProgramAddress(
                [Buffer.from('User_Bonk'), walletPK.toBuffer()],
                programId
            );
            console.log("PDA Token Account (Admin Test):", userTokenAccount.value[0].pubkey.toBase58());

            // 提取代幣的交易指令
            const ix = await program.methods
                .withdrawToken(new BN(amount))
                .accounts({
                    signer: walletPK,
                    pdaToken: pdaTokenAccount,
                    userAccount: userTokenAccount.value[0].pubkey,
                    user: userPda,
                    systemProgram: SystemProgram.programId,
                    Tokenprogram: TokenprogramID
                })
                .instruction();

            transaction = new Transaction().add(ix);

            // 發送交易
            transaction.feePayer = walletPK;
            transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

            const signature = await sendAndConfirmTransaction(connection, transaction, [adminKeypair]);
            await connection.confirmTransaction(signature, "confirmed");

            alert(`Withdraw ${type} Successful (Admin Test)!`);
            console.log("Transaction confirmed with signature:", signature);

    } catch (error) {
        console.error(`Withdraw ${type} Failed (Admin Test):`, error);
        alert(`Failed to withdraw ${type}.`);
    }
}

//事件監聽
document.addEventListener("DOMContentLoaded", function() {
    const withdrawButton = document.getElementById("withdrawButton");
    if (withdrawButton) {
        withdrawButton.addEventListener("click", async function () {
            // 獲取用戶輸入的值
            const type = document.getElementById("withdrawType").value; 
            const amount = document.getElementById("withdrawAmount").value;
            const mintAddress = document.getElementById("mintAddress").value; 

            if (!type || !amount) {
                alert("Please provide both type and amount.");
                return;
            }

            if (type === 'TOKEN' && !mintAddress) {
                alert("Mint address is required for token withdrawal.");
                return;
            }

            await withdraw(type, amount, mintAddress);
        });
    } else {
        console.error("Withdraw button not found.");
    }
});

// 按鈕和元素的選擇器
const confirmBtn = document.getElementById('confirm-btn');
const solBtn = document.getElementById('sol-btn');
const tokenBtn = document.getElementById('token-btn');
const customWithdrawInput = document.getElementById('custom-amount');
const withdrawSlider = document.getElementById('withdraw-amount');
const sliderValue = document.getElementById('slider-value');

// 確認按鈕事件處理
confirmBtn.addEventListener('click', async () => {
    // 讀取並解析用戶輸入的提款金額
    const amount = parseFloat(customWithdrawInput.value || 0);

    // 檢查提款金額是否有效 (大於零)
    if (amount === 0) {
        alert("Please enter a valid number greater than 0");
        return;  // 若金額無效，則停止進一步處理
    }
});

// 切換貨幣為 SOL
solBtn.addEventListener('click', () => {
    customWithdrawInput.setAttribute('step', '0.0001');  // For SOL
    switchCurrency('SOL');
});

// 切換貨幣為 TOKEN
tokenBtn.addEventListener('click', () => {
    customWithdrawInput.setAttribute('step', '1');  // For BONK
    switchCurrency('BONK');
});

// 自訂金額輸入事件處理
customWithdrawInput.addEventListener('input', () => {
    const value = parseFloat(customWithdrawInput.value || 0);
    
    if (value > walletBalances[currentCurrency]) {
        alert("The amount exceeds your available balance!");
        customWithdrawInput.value = walletBalances[currentCurrency]; // Limit input to available balance
    }
    
    withdrawSlider.value = customWithdrawInput.value;
    sliderValue.innerText = value.toFixed(currencyLabel.innerText === 'SOL' ? 4 : 0);
});

// 拉桿事件處理
withdrawSlider.addEventListener('input', () => {
    const value = parseFloat(withdrawSlider.value);  // Convert string to float
    sliderValue.innerText = value.toFixed(currencyLabel.innerText === 'SOL' ? 4 : 0);
    customWithdrawInput.value = value;
});