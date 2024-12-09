(()=>{"use strict";function e(e,t){var n=(e=document.querySelector(e)).getBoundingClientRect().top+window.pageYOffset-document.querySelector(".navbar").offsetHeight,a=window.pageYOffset,o=n-a,l=null;requestAnimationFrame((function e(n){null===l&&(l=n);var s=n-l,d=function(e,t,n,a){return(e/=a/2)<1?n/2*e*e+t:-n/2*(--e*(e-2)-1)+t}(s,a,o,t);window.scrollTo(0,d),s<t&&requestAnimationFrame(e)}))}async function t(){if(!window.solana||!window.solana.isPhantom)return console.log("not found wallet"),{};try{const e=await window.solana.connect();return console.log("Address:",e.publicKey.toString()),e}catch(e){console.log("Error:",e)}}function n(){const e=document.createElement("input");e.value=window.solana.publicKey.toString(),document.body.appendChild(e),e.select(),e.setSelectionRange(0,9999),document.execCommand("copy"),document.body.removeChild(e),alert("已複製金鑰")}function a(){const e=document.getElementById("loading-spinner");e&&(e.style.display="block")}function o(){const e=document.getElementById("loading-spinner");e&&(e.style.display="none")}async function l(e){const t=await fetch(`http://localhost:3000/api/users/info?user_name=${e}`,{method:"GET",headers:{"Content-Type":"application/json"}});return(await t.json()).recordset[0]}function s(e,t){return Math.floor(Math.random()*(t-e+1))+e}let d=[],c=[],i=1,r="friends";const m=document.getElementById("friends-invites-tbody"),y=document.getElementById("prev-page"),u=document.getElementById("next-page"),g=document.getElementById("current-page"),p=document.getElementById("friend-back-to-game"),E=document.getElementById("tab-friends"),v=document.getElementById("tab-invites"),h=document.getElementById("table-header-bonk"),b=document.getElementById("table-header-status"),k=document.getElementById("game_ui"),f=document.getElementById("friend");function B(e,t){const n="friends"===t?d:c,a=5*(e-1),o=a+5,l=n.slice(a,o);m.innerHTML="","friends"===t?(h.style.display="table-cell",b.style.display="table-cell",l.forEach((e=>{const t=document.createElement("tr");t.innerHTML=`\n                <td><img src="${e.avatar}" alt="Avatar" class="friend-avatar"></td>\n                <td>${e.nickname}</td>\n                <td>${e.bonkCount}</td>\n                <td><span class="status ${"Stretching"===e.status?"status-green":"status-red"}">${e.status}</span></td>\n                <td><button class="bonk-btn">BONK!</button></td>\n            `,m.appendChild(t)}))):"invites"===t&&(h.style.display="none",b.style.display="none",l.forEach((e=>{const t=document.createElement("tr");t.innerHTML=`\n                <td><img src="${e.avatar}" alt="Avatar" class="friend-avatar"></td>\n                <td>${e.nickname}</td>\n                <td>\n                    <button class="accept-btn">Accept</button>\n                    <button class="decline-btn">Decline</button>\n                </td>\n            `,m.appendChild(t)}))),function(e,t){g.textContent=e,y.disabled=1===e,u.disabled=e===Math.ceil(t/5)}(e,n.length)}const I=[{avatar:"https://via.placeholder.com/50",nickname:"John Doe",bonkEarnings:1500},{avatar:"https://via.placeholder.com/50",nickname:"Jane Smith",bonkEarnings:1200},{avatar:"https://via.placeholder.com/50",nickname:"Alice Green",bonkEarnings:900},{avatar:"https://via.placeholder.com/50",nickname:"Bob Brown",bonkEarnings:800},{avatar:"https://via.placeholder.com/50",nickname:"Lucy Black",bonkEarnings:700},{avatar:"https://via.placeholder.com/50",nickname:"Tom White",bonkEarnings:600},{avatar:"https://via.placeholder.com/50",nickname:"Chris Blue",bonkEarnings:500},{avatar:"https://via.placeholder.com/50",nickname:"Sophie Red",bonkEarnings:400},{avatar:"https://via.placeholder.com/50",nickname:"Henry Gold",bonkEarnings:300},{avatar:"https://via.placeholder.com/50",nickname:"Emma Silver",bonkEarnings:200}];document.addEventListener("DOMContentLoaded",(()=>{(function(){const e=document.getElementById("LoginSignUp-popup"),t=e.querySelector(".close"),n=document.getElementById("loginForm"),l=document.getElementById("signupForm"),s=document.getElementById("show-login"),d=document.getElementById("show-signup"),c=document.getElementById("Login-btn"),i=document.getElementById("profile"),r=document.getElementById("Logout-btn"),m=document.getElementById("Wallet_set"),y=document.getElementById("connect_wallet"),u=document.getElementById("game_ui"),g=localStorage.getItem("user_name");if(console.log(g),null!=g){m.style.display="block";const e=localStorage.getItem("bio"),t=localStorage.getItem("photoBase64");u.style.display="block",c.style.display="none",r.style.display="block",document.getElementById("user-nickname").innerText=localStorage.getItem("nick_name"),e&&(document.getElementById("user-bio-display").innerText=e),t&&(document.getElementById("user-avatar-image").src=t)}else m.style.display="none",i.style.display="none",c.style.display="block";c.addEventListener("click",(()=>{e.style.display="block"})),t.addEventListener("click",(()=>{e.style.display="none",l.style.display="flex",n.style.display="none"})),d.addEventListener("click",(e=>{e.preventDefault(),l.style.display="flex",n.style.display="none",l.classList.add("form-style")})),s.addEventListener("click",(e=>{e.preventDefault(),n.style.display="flex",l.style.display="none",n.classList.add("form-style")})),l.addEventListener("submit",(async t=>{t.preventDefault();const s=l.querySelector("#username").value,d=l.querySelector("#nickname").value,c=l.querySelector("#password").value,i={user_name:s,nick_name:d,password:c};if(c===l.querySelector("#confirmpassword").value)try{a();const t=await fetch("http://localhost:3000/api/users/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(o(),t.ok){const a=await t.json();alert(a.message),l.reset(),e.style.display="none",n.style.display="flex",l.style.display="none"}else{const e=await t.json();alert("Sign up failed:",e.message)}}catch(e){console.error("Error:",e),alert("Sign up failed:",e)}else alert("Password doesn't match")})),n.addEventListener("submit",(async t=>{t.preventDefault();const l=n.querySelector("#usernameLogin").value,s=n.querySelector("#passwordLogin").value;a();try{const t=await fetch("http://localhost:3000/api/users/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_name:l,password:s})});if(o(),t.ok){y.style.display="block";const n=await t.json();alert(n.message),await async function(e){const t=document.getElementById("user-nickname"),n=document.getElementById("user-bio-display"),a=document.getElementById("user-avatar-image");try{const o=await fetch(`\n            http://localhost:3000/api/users/info?user_name=${encodeURIComponent(e)}`,{method:"GET",headers:{"Content-Type":"application/json"}});if(o.ok){const l=(await o.json()).recordset[0];localStorage.setItem("user_name",e),localStorage.setItem("nick_name",l.Nick_name),localStorage.setItem("photoBase64",l.PhotoBase64),localStorage.setItem("bio",l.Bio),t.innerText=l.Nick_name,null!=l.Bio&&(n.innerText=l.Bio),null!=l.PhotoBase64&&(a.src=l.PhotoBase64)}else{const e=await o.json();alert(e.message)}}catch(e){console.error(e),alert("Login failed:",e)}}(l),c.style.display="none",r.style.display="block",e.style.display="none",u.style.display="block"}else{const e=await t.json();alert(e.message)}}catch(e){console.error("Error:",e),alert("Login failed:",e)}})),r.addEventListener("click",(()=>{y.style.display="none",localStorage.clear(),window.location.reload(),document.getElementById("Logout-btn").style.display="none",document.getElementById("Login-btn").style.display="display"}))})(),function(){const e=document.getElementById("game_ui"),t=document.getElementById("user-bio-display"),n=document.getElementById("user-bio-edit"),a=document.getElementById("edit-bio-button"),o=document.getElementById("save-bio-button"),l=document.getElementById("user-avatar-image"),s=document.getElementById("avatar-upload-input"),d=document.getElementById("user-back-button"),c=document.getElementById("profile");function i(){s.click()}d.addEventListener("click",(()=>{c.style.display="none",e.style.display="block"})),a.addEventListener("click",(()=>{n.value=t.innerText,n.style.display="block",t.style.display="none",a.style.display="none",o.style.display="block",l.classList.add("upload-mode"),l.addEventListener("click",i)})),o.addEventListener("click",(async()=>{t.innerText=n.value,n.style.display="none",t.style.display="block",a.style.display="block",o.style.display="none",l.classList.remove("upload-mode"),l.removeEventListener("click",i);const e=n.value,s=l.src,d=localStorage.getItem("user_name");(await fetch("http://localhost:3000/api/users/info",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({updateBio:e,photoBase64:s,user_name:d})})).ok?alert("Successfully saved"):alert("Saved Error")})),s.addEventListener("change",(e=>{const t=e.target.files[0];if(t){const e=new FileReader;e.onload=e=>{l.src=e.target.result},e.readAsDataURL(t)}}))}(),function(){const e=document.getElementById("game_ui"),t=document.getElementById("stretch_ui"),n=document.getElementById("stretch-button"),a=document.getElementById("back-button"),o=document.getElementById("back-button1"),d=document.getElementById("bonk_ui"),c=document.getElementById("Bonk-button"),i=document.getElementById("start-stretch-button"),r=document.getElementById("stop-stretch-button"),m=document.getElementById("wallet-overlay"),y=document.getElementById("connect-wallet-button"),u=document.getElementById("connect_wallet"),g=document.getElementById("user-info-button"),p=document.getElementById("profile"),E=document.getElementById("friends-button"),v=document.getElementById("friend"),h=document.getElementById("leaderboard-container");document.getElementById("leaderboard-button").addEventListener("click",(()=>{h.style.display="block",e.style.display="none"})),E.addEventListener("click",(()=>{v.style.display="block",e.style.display="none"})),g.addEventListener("click",(()=>{p.style.display="block",e.style.display="none"})),n.addEventListener("click",(()=>{e.style.display="none",t.style.display="block"})),a.addEventListener("click",(()=>{t.style.display="none",e.style.display="block"})),c.addEventListener("click",(()=>{e.style.display="none",d.style.display="block",async function(){const e=document.getElementById("bonk_page");var t='<label style="color: black;">Pick one to Bonk<br><br></label><div id="Can_bonk_list" >';const n=await fetch("http://localhost:3000/api/GetStretch",{method:"GET",headers:{"Content-Type":"application/json"}});var a=await n.json();a=a.recordset;var o=[0,1,2];a.length>3&&(o=function(e,t){const n=new Set;for(;n.size<3;){const e=s(0,t);n.add(e)}return Array.from(n)}(0,a.length-1));for(var d=[],c=0;c<3;c++)d.push(await l(a[o[c]].User_name)),t+=`\n        <div class="user-avatar TargetUser" id="user-avatar-image${c}">\n            <img src="${d[c].PhotoBase64}" alt="User Avatar">\n            <h5>${a[o[c]].User_name}<br>Max get：12<br>Need：12</h5>\n            <img id="selected${c}" src="./images/箭頭.png" class="arrow">\n        </div>`;t+="</div>",e.innerHTML=t;var i=[],r=[];for(let e=0;e<3;e++){let t="user-avatar-image"+e,n="selected"+e,a=()=>{document.getElementById(n).style.display="block"},o=()=>{document.getElementById(n).style.display="none"};console.log(a),document.getElementById(t).addEventListener("mousemove",a),document.getElementById(t).addEventListener("mouseleave",o),i.push(a),r.push(o)}for(let e=0;e<3;e++){var m="user-avatar-image"+e;document.getElementById(m).addEventListener("click",(()=>{for(let e=0;e<3;e++)document.getElementById("user-avatar-image"+e).removeEventListener("mousemove",i[e]),document.getElementById("user-avatar-image"+e).removeEventListener("mouseleave",r[e]);console.log(d),"-1"==document.getElementById("Target").value&&(document.getElementById("Target").value=o[e],document.getElementById("Bonk").disabled=!1)}))}}()})),o.addEventListener("click",(()=>{d.style.display="none",e.style.display="block"})),y.addEventListener("click",(()=>{u.click(),m.style.display="none"})),i.addEventListener("click",(async()=>{await fetch(`http://localhost:3000/api/ChangeStretch?user_name=${localStorage.getItem("user_name")}&action=true`,{method:"GET",headers:{"Content-Type":"application/json"}})&&(i.style.display="none",r.style.display="block")})),r.addEventListener("click",(async()=>{await fetch(`http://localhost:3000/api/ChangeStretch?user_name=${localStorage.getItem("user_name")}&action=`,{method:"GET",headers:{"Content-Type":"application/json"}})&&(i.style.display="block",r.style.display="none")}))}(),async function(){const e=document.getElementById("connect_wallet"),a=document.getElementById("wallet-overlay"),o=document.getElementById("Wallet_Contrel"),l=document.getElementById("Copy_Address"),s=document.getElementById("Disconnect"),d=document.getElementById("Wallet_set");if(localStorage.getItem("isConnectWallet")){var c=(await t()).publicKey.toString();e.innerText=c.slice(0,4)+"..."+c.slice(c.length-5,c.length-1),a.style.display="none"}e.addEventListener("click",(async n=>{var o=await t();o!={}?(n=o.publicKey.toString(),e.innerText=n.slice(0,4)+"..."+n.slice(n.length-5,n.length-1),a.style.display="none",localStorage.setItem("isConnectWallet",!0)):("phantom"in window||window.open("https://phantom.app/","_blank"),localStorage.removeItem("isConnectWallet"))})),document.getElementById("connect_wallet").addEventListener("mouseover",(()=>{null!=window.solana.publicKey&&(o.style.display="block")})),l.addEventListener("click",n),s.addEventListener("click",(()=>{!async function(){if(window.solana&&window.solana.isPhantom)try{window.solana.isConnected&&(await window.solana.disconnect(),console.log("Disconnected"))}catch(e){console.log("Error:",e)}else console.log("not found wallet")}(),e.innerText="connect",o.style.display="none",a.style.display="flex"})),d.addEventListener("mouseleave",(()=>{o.style.display="none"}))}(),async function(){E.addEventListener("click",(()=>{r="friends",i=1,E.classList.add("active"),v.classList.remove("active"),B(i,r)})),v.addEventListener("click",(()=>{r="invites",i=1,E.classList.remove("active"),v.classList.add("active"),B(i,r)})),y.addEventListener("click",(()=>{i>1&&(i--,B(i,r))})),u.addEventListener("click",(()=>{i<Math.ceil(("friends"===r?d:c).length/5)&&(i++,B(i,r))})),p.addEventListener("click",(()=>{k.style.display="block",f.style.display="none"})),B(i,r)}(),function(){const e=document.getElementById("leaderboard-tbody"),t=document.getElementById("rules-modal"),n=document.getElementById("close-rules-modal"),a=document.getElementById("leaderboard-rules-btn"),o=document.getElementById("back-to-game-leaderboard"),l=document.getElementById("game_ui"),s=document.getElementById("leaderboard-container");a.addEventListener("click",(()=>{t.classList.remove("hidden")})),n.addEventListener("click",(()=>{t.classList.add("hidden")})),o.addEventListener("click",(()=>{l.style.display="block",s.style.display="none"})),e.innerHTML="",I.slice(0,10).forEach(((t,n)=>{const a=document.createElement("tr");a.innerHTML=`\n            <td>${n+1}</td>\n            <td><img src="${t.avatar}" alt="Avatar" class="friend-avatar"></td>\n            <td>${t.nickname}</td>\n            <td>${t.bonkEarnings}</td>\n        `,e.appendChild(a)}))}(),document.querySelectorAll(".navbar a").forEach((t=>{t.addEventListener("click",(function(t){t.preventDefault(),e(this.getAttribute("href"),1e3)}))}));const m=document.getElementsByClassName("Guide_To_User_Info");Array.prototype.forEach.call(m,(function(t){t.addEventListener("click",(function(){e("#User_Info",1e3)}))}))}))})();