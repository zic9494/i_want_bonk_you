import sql from 'mssql'; 
import express from 'express'; 
import fs from 'fs/promises';
import cors from 'cors';

//node db.js運行Express伺服器，這樣我們就可以call自己定義的API去操作SQL

const config ={ 
    server: 'bonk-you.database.windows.net', //伺服器名稱
    user: 'bonkman', //帳號名稱
    password: 'BonkBonk1234', //密碼
    database: 'Bonk You', //資料庫名稱
};

let pool = null;

async function connectToDatabase() {    //連接SQL Server
    try {
        console.log(typeof config.server);
        pool = await sql.connect(config);
        console.log('成功連接！');
    } catch (err) {
        console.error('連接失敗:', err);
    }
}

async function init_db() {  //初始化資料庫
    try{
        const initSQL = await fs.readFile('./init.sql','utf-8');
        await pool.request().query(initSQL);
        console.log('initialize success!')
    }catch(err){
        console.error('Error:',err)
    }
}

await connectToDatabase();
await init_db();


const app = express();
app.use(cors()); //中間件:允許跨域請求
app.use(express.json()); //中間件:解析json檔

app.post('/api/users',async (req,res) => {  //新增使用者的POST請求
    const newUser = {
        address:req.body.address,
        userName:req.body.userName,
        photoURL:req.body.photoURL
    }
    await pool.request()
        .input('Address', sql.Char(50), newUser.address)
        .input('User_name', sql.VarChar(50), newUser.userName)
        .input('PhotoURL', sql.VarChar(255),newUser.photoURL)
        .query(
            `INSERT INTO Users(Address,User_name,PhotoURL)
            VALUES (@Address, @User_name, @PhotoURL)`
        );
    console.log('Add success');

});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`伺服器運行中：http://localhost:${PORT}`);
});