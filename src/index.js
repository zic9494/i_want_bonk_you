// import { setCookie,  getCookie} from "./cookie.js";
import { Generate_Game_Page, smoothScroll } from "./PageControl.js"
import {connectWallet,disconnectWallet} from "./wallet.js"
//import {addUser} from "../sql/fetch_test.js"
import {setLoginAandSignUp} from "./LoginSignUp.js"
import { setUserInfo } from "./UserInfo.js"


document.addEventListener('DOMContentLoaded', () => {
    setLoginAandSignUp();
    setUserInfo();

    console.log('tets')
    //導覽列的動畫
    const navbarAnchors = document.querySelectorAll('.navbar a');
    navbarAnchors.forEach(anchor => {
        anchor.addEventListener('click', function(e){
            e.preventDefault()
            var targetID = this.getAttribute('href')
            smoothScroll(targetID, 1000) // 呼叫捲動函式(ID, time(ms))
        })
    })

    //主頁的點擊引導至輸入錢包地址
    const Guide_To_Info = document.getElementsByClassName("Guide_To_User_Info");
    Array.prototype.forEach.call(Guide_To_Info, function(anchor) {
            anchor.addEventListener("click", function() {
            smoothScroll("#User_Info", 1000);
        });
    });

    //送出錢包資料後
    document.getElementById("connect_wallet").addEventListener("click", async (Key)=>{
        var connected = await connectWallet()
        if(connected != {}){
            var Key = connected.publicKey.toString()
            document.getElementById("connect_wallet").innerText = Key.slice(0,4)+"..."+Key.slice(Key.length-5, Key.length-1)
            Generate_Game_Page()
        }else{
            if(!('phantom' in window)){
                window.open('https://phantom.app/', '_blank')
            }
        }
    })

    document.getElementById("connect_wallet").addEventListener("mouseover", ()=>{
        if (document.getElementById("connect_wallet").innerText != "connect"){
            document.getElementById("Wallet_Contrel").style.display = "block"
        }
    })

    document.getElementById("Wallet_set").addEventListener("mouseleave",()=>{
        document.getElementById("Wallet_Contrel").style.display = 'none'
    })



    document.getElementById("Quit").addEventListener("click", ()=>{
        disconnectWallet()
        document.getElementById("Game_UI").style.display = "none"
        document.getElementById("MSG_Connect").style.display = "block"
        smoothScroll("#User_Info", 1000)
    })


})

