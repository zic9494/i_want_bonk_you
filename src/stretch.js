
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
const DuringTimetext = document.getElementById('duration-display')
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

    const [tokenAccountpda,tokenAccountBump] = await PublicKey.findProgramAddress(
        [Buffer.from('User_Bonk'),walletPK.toBuffer()],programId);
    
    end_streching.addEventListener('click',async ()=>{


        const userPdaAccount = await program.account.userPda.fetch(sol_pda); //用userPda類別去查
        const startTime = userPdaAccount.interestStartTime;
        const token = userPdaAccount.stretchBetToken;
        const nowTime = Math.floor(Date.now() / 1000)
            
        const betAmount = userPdaAccount.stretchBetAmount.toNumber(); // 單位：Lamports (如果是 SOL，需先轉換)
        console.log("bet:",betAmount);
        const hourlyRate = 0.05;

        // 計算已經過的小時數
        const elapsedTimeInSeconds = nowTime - startTime; // 經過的秒數
        const elapsedHours = Math.floor(elapsedTimeInSeconds / (60 * 1)); // 經過的小時數（向下取整）
        
        const reward = betAmount * hourlyRate * elapsedHours;

        console.log("下注金額:", betAmount);
        console.log("經過小時數:", elapsedHours);
        console.log("獎勵:", reward / 1_000_000_000, "SOL"); 

        const isSuccess = await endStretch(admin_pda,adminKeypair,sol_pda,program,reward,token,tokenAccountpda);

        if(isSuccess){
            alert("Stretched back Success");
            let IntervalID = parseInt(localStorage.getItem("IntervalID"))
            clearInterval(IntervalID)
            openSettingsButton.style.display = "inline-block";
            end_streching.style.display = 'none';
            neck.classList.remove('stretch');
            await StretchBack()
            window.setTimeout(()=>{ 
                DuringTimetext.innerText = "Stretch Duration: 0 seconds"
                let DuringTime = 0
                localStorage.setItem("DuringTime", DuringTime)
            }, 500)
            alert(`You got${reward} ${token}`)


        }else{
            alert("Fail to stretched back ");
        }
    });
    // 打開彈窗
    openSettingsButton.addEventListener('click', () => {
        modalSolBtn.click()
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
        const sol_balance = connection.getBalance(walletPK) / 1_000_000_000;

        const betValue = parseFloat(modalBetAmount.value || 0);
        if (betValue <= 0 && betValue>=sol_balance && modalCurrencyLabel.innerText=='SOL') {
            alert('Please enter a valid bet amount!');  
            return;
        }

        const isSuccess = await startStretch(walletPK,sol_pda,program,modalCurrencyLabel.innerText,modalBetAmount.value,10);

        if(isSuccess){
        
            alert("Stretch Successfully");
            neck.classList.add('stretch');
            end_streching.style.display = "inline-block";
            stretchSettingsModal.style.display = 'none';
            openSettingsButton.style.display = 'none';
            await StretchOut();
            localStorage.setItem("DuringTime", 0)
            let IntervalID = window.setInterval(()=>{
                let DuringTime = parseInt(localStorage.getItem("DuringTime"))
                DuringTime += 1
                DuringTimetext.innerText = "Stretch Duration: "+DuringTime+" seconds"
                localStorage.setItem("DuringTime", DuringTime)
            }, 1000)
            localStorage.setItem("IntervalID", IntervalID)
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
        }else{
            amount *= 100_000;
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

async function endStretch(adminPda, adminKeypair, userPda, program, reward, token,tokenAccountpda) {
    try {
      // 計算 Jackpot PDA
      
      const [jackpot_pda, jackpot_bump] = await PublicKey.findProgramAddress(
        [Buffer.from('jackpot'), adminKeypair.publicKey.toBuffer()],
        programId
      );
      const [jackpotTokenAccount, jackpotTokenAccount_bump] = await PublicKey.findProgramAddress(
        [Buffer.from('jackpot_Bonk'), adminKeypair.publicKey.toBuffer()],
        programId
      );
  
      console.log(adminKeypair.publicKey.toBase58());
      console.log(adminKeypair);
      console.log(userPda);
  
      // StretchEnd 指令
      const ix = await program.methods
        .stretchEnd() // 指令名
        .accounts({
          signer: adminKeypair.publicKey, // 簽名者
          user: userPda,                 // 用戶 PDA
          clock: clockSysvar,            // 系統時鐘
          admin: adminPda                // 管理員 PDA
        })
        .instruction(); // 發送指令
  
      // 初始化交易
      const transaction = new Transaction().add(ix);
  
      // 如果是 SOL，添加 transferSol 指令
      let ix2 = null;
      console.log(reward)

      if (token === 'SOL') {
        console.log(reward)

        ix2 = await program.methods
          .transferSol(new BN(reward), true) 
          .accounts({
            signer: adminKeypair.publicKey, 
            sender: userPda,           
            recipient: userPda,            
            admin: adminPda,               
            jackpot: jackpot_pda           
          })
          .instruction();

      }else{
        ix2 = await program.methods
          .transferBonk(new BN(reward)) 
          .accounts({
            signer: adminKeypair.publicKey,
            sender: jackpotTokenAccount,           // Jackpot PDA 作為發送者
            recipient: tokenAccountpda,           
            user: userPda,               
            admin: adminPda,
            jackpot: jackpot_pda           
          })
          .instruction();
  
      }
      transaction.add(ix2);

      
  
      // 配置交易
      transaction.feePayer = adminKeypair.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
  

      // 簽名並發送交易
      const signature = await sendAndConfirmTransaction(connection, transaction, [adminKeypair]);
      console.log('交易已確認，簽名:', signature);
  
      return true;
    } catch (err) {
      console.error(err);
      return false;
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

