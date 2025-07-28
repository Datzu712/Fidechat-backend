create table "USER"
(
    ID            VARCHAR2(36)        not null
        constraint USER_PK
            primary key,
    USERNAME      VARCHAR2(255)       not null,
    EMAIL         VARCHAR2(255)       not null,
    PASSWORD_HASH VARCHAR2(255)       not null,
    IS_BOT        NUMBER(1) default 0 not null
)
/

comment on column "USER".ID is 'UUID'
/

create table GUILD
(
    ID        VARCHAR2(36)  not null
        constraint GUILD_PK
            primary key,
    NAME      VARCHAR2(100) not null,
    ICON_URL  VARCHAR2(500),
    IS_PUBLIC NUMBER(1) default 0,
    OWNER_ID  VARCHAR2(36)  not null
        constraint GUILD_USER_ID_FK
            references "USER"
                on delete cascade
)
/

create table GUILD_USERS
(
    ID       VARCHAR2(36) not null
        constraint GUILD_USERS_PK
            primary key,
    GUILD_ID VARCHAR2(36) not null
        constraint GUILD_USERS_GUILD_ID_FK
            references GUILD,
    USER_ID  VARCHAR2(36) not null
        constraint GUILD_USERS_USER_ID_FK
            references "USER",
    constraint GUILD_USERS_PK_2
        unique (GUILD_ID, USER_ID)
)
/

comment on table GUILD_USERS is 'Guild members'
/

create table CHANNEL
(
    ID          VARCHAR2(36)     not null
        constraint CHANNEL_PK
            primary key,
    NAME        VARCHAR2(100)    not null,
    DESCRIPTION VARCHAR2(500),
    POSITION    NUMBER default 0 not null,
    GUILD_ID    VARCHAR2(36)     not null
        constraint CHANNEL_GUILD_ID_FK
            references GUILD
)
/

comment on column CHANNEL.POSITION is 'Used for sorting channels'
/


