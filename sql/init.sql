IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users(
        Id INT IDENTITY(1,1) PRIMARY KEY, 
        User_name VARCHAR(50) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        Nick_name VARCHAR(50) NOT NULL,     
        PhotoBase64 NVARCHAR(MAX) NULL,
        Bio VARCHAR(255) NULL,

        Created_at DATETIME2 DEFAULT GETDATE()     
    )
END
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name='Online_Users' AND xtype='U')
BEGIN
    CREATE TABLE Online_Users(
        User_name VARCHAR(50) NOT NULL UNIQUE,
        Stretched BIT NOT NULL DEFAULT 0,
        Bonked_times INT NOT NULL DEFAULT 0,
        SOL_balance INT NOT NULL DEFAULT 0,
        BONK_balance INT NOT NULL DEFAULT 0,
        Pulic_key VARCHAR(50),
    )
END
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name='Friendships' AND xtype='U')
BEGIN
    CREATE TABLE Friendships(
        From_user VARCHAR(50) NOT NULL ,
        To_user VARCHAR(50) NOT NULL ,
        Status VARCHAR(10) NOT NULL DEFAULT 'pending',
        Created_at DATETIME2 DEFAULT GETDATE() ,
        PRIMARY KEY (From_user,To_user) ,
        FOREIGN KEY (From_user) REFERENCES Users(User_name) ,
        FOREIGN KEY (To_user) REFERENCES Users(User_name) ,
        CHECK (Status in ('pending','confirmed')),
    );
END

IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name='Attacks' AND xtype='U')
BEGIN
    CREATE TABLE Attacks(
        Attack_id INT IDENTITY(1,1) PRIMARY KEY, -- 唯一 ID
        Attacker_user_name VARCHAR(50) NOT NULL, -- 攻擊者
        Target_user_name VARCHAR(50) NOT NULL, -- 被攻擊者
        Last_attack_time DATETIME2 DEFAULT GETDATE(), -- 最近一次攻擊的時間
        FOREIGN KEY (Attacker_user_name) REFERENCES Users(User_name),
        FOREIGN KEY (Target_user_name) REFERENCES Users(User_name)
    );
END


IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name='Pda' AND xtype='U')
BEGIN
    CREATE TABLE Pda(
        Wallet_address VARCHAR(50) PRIMARY KEY, 
        Pda_addresss VARCHAR(50) NULL, 
        Created_at DATETIME2 DEFAULT GETDATE() ,
    );


    
END



 