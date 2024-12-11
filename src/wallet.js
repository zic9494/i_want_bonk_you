
//Phantom文檔:https://docs.phantom.app/solana/establishing-a-connection

async function connectWallet(){  //連接錢包
    if(window.solana && window.solana.isPhantom){
        try{
            const response = await window.solana.connect();
            console.log("Address:",response.publicKey.toString());
            return response
        }catch(err){
            console.log("Error:",err);
        }
    }else{
        console.log("not found wallet");
        return {}
    }
}

async function disconnectWallet(){   //斷開連接
    if(window.solana && window.solana.isPhantom){
        try{
            if(window.solana.isConnected){
                await window.solana.disconnect();
                console.log("Disconnected");
            }  
        }catch(err){
            console.log("Error:",err);
        }
    }else{
        console.log("not found wallet");
    }
}

function Copy_Wallet(){
    const TempInput = document.createElement("input")
    TempInput.value = window.solana.publicKey.toString()
    document.body.appendChild(TempInput)

    TempInput.select()
    TempInput.setSelectionRange(0,9999)
    document.execCommand("copy")

    document.body.removeChild(TempInput)
    alert("已複製金鑰")
}

export async function setWallet(){
    const connectWalletBtn = document.getElementById("connect_wallet");
    const gameOverlay = document.getElementById("wallet-overlay");
    const walletList = document.getElementById("Wallet_Contrel");
    const copyWallet = document.getElementById("Copy_Address");
    const disconnect = document.getElementById("Disconnect");
    const wrapWallet = document.getElementById("Wallet_set");
    const walletStatus = localStorage.getItem('isConnectWallet');
    if(walletStatus){
        var connected = await connectWallet();
        var Key = connected.publicKey.toString()
        connectWalletBtn.innerText = Key.slice(0,4)+"..."+Key.slice(Key.length-5, Key.length-1)
        gameOverlay.style.display = 'none';
    }
    
    //送出錢包資料後
    connectWalletBtn.addEventListener("click", async (Key)=>{
        var connected = await connectWallet()
        if(connected != {}){
            var Key = connected.publicKey.toString()
            connectWalletBtn.innerText = Key.slice(0,4)+"..."+Key.slice(Key.length-5, Key.length-1)
            gameOverlay.style.display = 'none';
            localStorage.setItem('isConnectWallet',true);
            await UpdateKey(Key)
        }else{
            if(!('phantom' in window)){
                window.open('https://phantom.app/', '_blank')
            }
            localStorage.removeItem('isConnectWallet');
        }
        
    });

    //滑鼠在錢包按鈕上
    document.getElementById("connect_wallet").addEventListener("mouseover", ()=>{
        if (window.solana.publicKey != null){
            walletList.style.display = "block";
        }
    });

    copyWallet.addEventListener("click", Copy_Wallet)

    //斷開錢包的處理
    disconnect.addEventListener("click",()=>{
        disconnectWallet();
        connectWalletBtn.innerText="connect";
        walletList.style.display = "none";
        gameOverlay.style.display = 'flex';
    })

    //滑鼠離開錢包按鈕
    wrapWallet.addEventListener("mouseleave",()=>{
        walletList.style.display = 'none';
    });
}


async function UpdateKey(key) {
    resp = await fetch(
        `http://localhost:3000/api/user/pulickey?public_key=${key}&user_name=${localStorage.getItem("user_name")}`,{
        method:'GET',
        headers: {
            'Content-Type' : 'application/json'
        }
    })
}
