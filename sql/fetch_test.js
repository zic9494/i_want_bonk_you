
//沒寫重複邏輯，之後再補哈哈

export async function registerUser(user_name,nick_name,password) {   //增加使用者資料
    //這邊測試用，之後會改傳入參數的
    const newUser = {
        user_name,
        nick_name,
        password,
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