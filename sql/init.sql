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
    )
END
IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name='Friendsships' AND xtype='U')
BEGIN
    CREATE TABLE Friendsships(
        User_id1 INT NOT NULL ,
        User_id2 INT NOT NULL ,
        Status VARCHAR(10) NOT NULL DEFAULT 'pending',
        Created_at DATETIME2 DEFAULT GETDATE() ,
        PRIMARY KEY (User_id1,User_id2) ,
        FOREIGN KEY (User_id1) REFERENCES Users(Id) ON DELETE CASCADE,
        FOREIGN KEY (User_id2) REFERENCES Users(Id) ON DELETE CASCADE,
        CHECK (Status in ('pending','confirmed')),
        CHECK (User_id1 < User_id2),
    );
END

 