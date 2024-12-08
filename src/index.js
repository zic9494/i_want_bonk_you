// import { setCookie,  getCookie} from "./cookie.js";
import { smoothScroll } from "./PageControl.js"
import { setWallet } from "./Wallet.js";
//import {addUser} from "../sql/fetch_test.js"
import {setLoginAandSignUp} from "./LoginSignUp.js"
import { setUserInfo } from "./UserInfo.js"
import { setGamePage } from "./GamePage.js"
import { setFriend } from "./Friends.js";


document.addEventListener('DOMContentLoaded', () => {
    setLoginAandSignUp();
    setUserInfo();
    setGamePage();
    setWallet();
    setFriend();
    //導覽列的動畫
    const navbarAnchors = document.querySelectorAll('.navbar a');
    navbarAnchors.forEach(anchor => {
        anchor.addEventListener('click', function(e){
            e.preventDefault()
            var targetID = this.getAttribute('href')
            smoothScroll(targetID, 1000) // 呼叫捲動函式(ID, time(ms))
        })
    });

    //主頁的點擊引導至輸入錢包地址
    const Guide_To_Info = document.getElementsByClassName("Guide_To_User_Info");
    Array.prototype.forEach.call(Guide_To_Info, function(anchor) {
            anchor.addEventListener("click", function() {
            smoothScroll("#User_Info", 1000);
        });
    });

    

})

