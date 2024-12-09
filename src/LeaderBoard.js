// 排行榜數據(test)
const leaderboardData = [
    { avatar: "https://via.placeholder.com/50", nickname: "John Doe", bonkEarnings: 1500 },
    { avatar: "https://via.placeholder.com/50", nickname: "Jane Smith", bonkEarnings: 1200 },
    { avatar: "https://via.placeholder.com/50", nickname: "Alice Green", bonkEarnings: 900 },
    { avatar: "https://via.placeholder.com/50", nickname: "Bob Brown", bonkEarnings: 800 },
    { avatar: "https://via.placeholder.com/50", nickname: "Lucy Black", bonkEarnings: 700 },
    { avatar: "https://via.placeholder.com/50", nickname: "Tom White", bonkEarnings: 600 },
    { avatar: "https://via.placeholder.com/50", nickname: "Chris Blue", bonkEarnings: 500 },
    { avatar: "https://via.placeholder.com/50", nickname: "Sophie Red", bonkEarnings: 400 },
    { avatar: "https://via.placeholder.com/50", nickname: "Henry Gold", bonkEarnings: 300 },
    { avatar: "https://via.placeholder.com/50", nickname: "Emma Silver", bonkEarnings: 200 },
];

export function setLeaderBoard(){
    const leaderboardTbody = document.getElementById("leaderboard-tbody");
    const rulesModal = document.getElementById("rules-modal");
    const closeRulesModal = document.getElementById("close-rules-modal");
    const rulesBtn = document.getElementById("leaderboard-rules-btn");
    const backToGameLeaderboard = document.getElementById("back-to-game-leaderboard");
    const gameUI = document.getElementById("game_ui");
    const leaderBoard = document.getElementById("leaderboard-container");
    
    // 打開規則彈窗
    rulesBtn.addEventListener("click", () => {
        rulesModal.classList.remove("hidden");
    });

    // 關閉規則彈窗
    closeRulesModal.addEventListener("click", () => {
        rulesModal.classList.add("hidden");
    });

    // 返回按鈕
    backToGameLeaderboard.addEventListener("click", () => {
        gameUI.style.display = 'block';
        leaderBoard.style.display = 'none';
    });

    //渲染排行榜
    leaderboardTbody.innerHTML = "";
    leaderboardData.slice(0, 10).forEach((player, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${player.avatar}" alt="Avatar" class="friend-avatar"></td>
            <td>${player.nickname}</td>
            <td>${player.bonkEarnings}</td>
        `;
        leaderboardTbody.appendChild(row);
    });
    
}



