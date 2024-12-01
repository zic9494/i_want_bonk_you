
//沒寫重複邏輯，之後再補哈哈

export async function addUser() {   //增加使用者資料
    //這邊測試用，之後會改傳入參數的
    const newUser = {
        address: 'Ft7kkzSfKS4SsaKftWBnRVrEmuuDBYep3kDaSM3YTeVg',
        userName: 'Bang',
        photoURL: 'https://cdn.discordapp.com/attachments/920993133741875225/1312824765324722236/Z.png?ex=674de6d7&is=674c9557&hm=2921e28179955bc0665bc2c6e799496faed64bcbe809473c24f6dc5cb843f930&'
    };

    try{
        const response = await fetch('http://localhost:3000/api/users',{    //發post請求增加用戶
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(newUser)
        });
        if(!response.ok){
            throw new Error('AddUser Error! status: ',response.status);
        }

    } catch(err) {
        console.error('Error:',err.message);
    }
}