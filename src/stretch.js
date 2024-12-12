
import { Connection,PublicKey,Keypair,Transaction
    ,SystemProgram,sendAndConfirmTransaction,
    TransactionInstruction,SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor'; 
import idl from '../idl/idl.json'; // 您的 IDL 檔案
import BN from 'bn.js';
import { Buffer } from 'buffer';
import { connection, provider } from './deposit.js';
import bs58 from 'bs58';

const base58SecretKey = "ng4LZxjMi8wfwii2YGMApVfQDQGw3M2knKu83qqcoukK2bp53AtKe6KZ2K2DSh4Xn9uzV9ZHJywFrMMojRztHvi";
//調用合約會需要的參數
const BONK_MINT = new PublicKey("GGmKGGs29t8k3WEpFJkWrsLLymHzbC8CSEAXyjUfGcEM");
const tokenProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const rentSysvarId = new PublicKey("SysvarRent111111111111111111111111111111111");
const counter = new PublicKey("3ms6Hz7JkPm6NFGFdwkXgnAMXitMQHKrJjytvSXLomTJ");
const clockSysvar = new PublicKey("SysvarC1ock11111111111111111111111111111111")
const programId = new PublicKey('EiSSSmeYvZUPSCHwQgHY27hN6WjjDQTaGXvEvX37KX8F');

const end_streching = document.getElementById('stop-stretch-button')
const stretchSettingsModal = document.getElementById('stretch-settings-modal');
const confirmSettingsButton = document.getElementById('confirm-settings-button');
const modalSolBtn = document.getElementById('modal-sol-btn');
const modalBonkBtn = document.getElementById('modal-bonk-btn');
const modalCurrencyLabel = document.getElementById('modal-currency-label');
const modalBetAmount = document.getElementById('modal-bet-amount');
const neck = document.getElementById('neck');
let selectedCurrency = 'BONK';

const openSettingsButton = document.getElementById('open-settings-button');
const closeSettingsModal = document.getElementById('close-settings-modal');

export async function setStretch(){
    const adminKeypair = loadKeypairFromJson();
    const wallet = await window.solana.connect();  //可優化
    const walletPK = wallet.publicKey;
    const program = new Program(idl, programId, provider);
    const [sol_pda,sol_bump] = await PublicKey.findProgramAddress(
        [Buffer.from('user_solana'),walletPK.toBuffer()],programId);
    
    const [admin_pda,admin_bump] = await PublicKey.findProgramAddress(
        [Buffer.from('admin')],programId);
    
    end_streching.addEventListener('click',async ()=>{
        const isSuccess = await endStretch(admin_pda,adminKeypair,sol_pda,program);
        if(isSuccess){
            alert("Stretched back Success");
            openSettingsButton.style.display = "inline-block";
            end_streching.style.display = 'none';
            neck.classList.remove('stretch');
        }else{
            alert("Fail to stretched back ");
        }
    });
    // 打開彈窗
    openSettingsButton.addEventListener('click', () => {
        stretchSettingsModal.style.display = 'flex';
    });

    // 關閉彈窗
    closeSettingsModal.addEventListener('click', () => {
        stretchSettingsModal.style.display = 'none';
    });
    
    // 切換貨幣
    modalSolBtn.addEventListener('click', () => switchCurrency('SOL'));
    modalBonkBtn.addEventListener('click', () => switchCurrency('BONK'));
    
    function switchCurrency(currency) {
        selectedCurrency = currency;
        modalSolBtn.classList.toggle('active', currency === 'SOL');
        modalBonkBtn.classList.toggle('active', currency === 'BONK');
        modalCurrencyLabel.innerText = currency;
        modalBetAmount.value = 'Enter your bet';
        modalBetAmount.setAttribute('step', currency === 'SOL' ? '0.0001' : '1');
        modalBetAmount.setAttribute('min', currency === 'SOL' ? '0.0001' : '1');
    }

    // 確認設置
    confirmSettingsButton.addEventListener('click', async () => {
        const betValue = parseFloat(modalBetAmount.value || 0);
        if (betValue <= 0) {
            alert('Please enter a valid bet amount!');  
            return;
        }

        const isSuccess = true;
        //const isSuccess = await startStretch(walletPK,sol_pda,program,modalCurrencyLabel.innerText,modalBetAmount.value,10);
        if(isSuccess){
            alert("Stretch Successfully");
            neck.classList.add('stretch');
            end_streching.style.display = "inline-block";
            stretchSettingsModal.style.display = 'none';
            openSettingsButton.style.display = 'none';
        }else{
            alert("fail to stretch. Please try again");
            stretchSettingsModal.style.display = 'none';
        }
        
    });
    

    //縮回來
    //end_streching.addEventListener("click", StretchBack)


}

async function startStretch(walletPK,user_pda,program,token,amount,stopLoss) {
    try{
        //user的PDA
        console.log(walletPK,program,token,amount,stopLoss);
        if(token==='SOL'){
            amount *= 1_000_000_000;
        }
        
        const ix = await program.methods
            .stretchStart(new BN(amount),stopLoss,token) // 無參數的情況
            .accounts({
                signer: walletPK,
                user:user_pda,
                systemProgram: SystemProgram.programId,
                clock:clockSysvar
            })
            .instruction();
        const transaction = new Transaction().add(ix);

        transaction.feePayer = walletPK;
        transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

        const signature = await window.solana.signAndSendTransaction(transaction);

        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transaction confirmed with signature:", signature);
        return true;
        
    }catch(err){
        console.error(err);
        return false;
    }
}

async function endStretch(adminPda,admin,userPda,program) {
  try{
    console.log(admin.publicKey.toBase58());
    console.log(admin);
    console.log(userPda);
    const ix = await program.methods
    .stretchEnd() // 指令名
    .accounts({
        signer: admin.publicKey, 
        user: userPda,           
        clock: clockSysvar,      
        admin: adminPda          
    })
    .instruction() // 發送交易
    const transaction = new Transaction().add(ix);

    transaction.feePayer = admin.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

     // 發送並確認交易
     const signature = await sendAndConfirmTransaction(connection, transaction, [admin]);
     console.log('交易已確認，簽名:', signature);

    return true;
  }catch(err){
    console.error(err);
    
  }
}

async function StretchOut() {
    const resp = await fetch(
        `http://localhost:3000/api/ChangeStretch?user_name=${localStorage.getItem("user_name")}&action=true`,{
        method:'GET',
        headers: {
            'Content-Type' : 'application/json'
        }
        }
    )
}
async function StretchBack() {
    const resp = await fetch(
        `http://localhost:3000/api/ChangeStretch?user_name=${localStorage.getItem("user_name")}&action=`,{
        method:'GET',
        headers: {
            'Content-Type' : 'application/json'
        }
        }
    )
}

function loadKeypairFromJson() {
    try {

        const secretKey = bs58.decode(base58SecretKey);

        // 使用 Keypair.fromSecretKey 導入密鑰對
        const keypair = Keypair.fromSecretKey(secretKey);
        console.log('Keypair 載入成功:', keypair.publicKey.toBase58());
        return keypair;
    } catch (error) {
        console.error('載入 Keypair 時發生錯誤:', error);
        throw error;
    }
}

