IF NOT EXISTS (SELECT * FROM sys.sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users(
        Address char(50) PRIMARY KEY,
        User_name varchar(50) NOT NULL,
        PhotoURL varchar(255) NOT NULL
    )
END