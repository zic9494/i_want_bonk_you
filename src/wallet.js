import * as solanaWeb3 from "@solana/web3.js"
//Phantom文檔:https://docs.phantom.app/solana/establishing-a-connection

export async function connectWallet(){  //連接錢包
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

export async function disconnectWallet(){   //斷開連接
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

export function Copy_Wallet(){
    const TempInput = document.createElement("input")
    TempInput.value = window.solana.publicKey.toString()
    document.body.appendChild(TempInput)

    TempInput.select()
    TempInput.setSelectionRange(0,9999)
    document.execCommand("copy")

    document.body.removeChild(TempInput)
    alert("已複製金鑰")
}