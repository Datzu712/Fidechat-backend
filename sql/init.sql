create TYPE t_channel_info_table AS TABLE OF t_channel_info
/

create TYPE t_guild_info_table AS TABLE OF t_guild_info
/

create table APP_USER
(
    ID         VARCHAR2(36)        not null
        constraint USER_PK
            primary key,
    USERNAME   VARCHAR2(255)       not null,
    EMAIL      VARCHAR2(255)       not null,
    IS_BOT     NUMBER(1) default 0 not null,
    AVATAR_URL VARCHAR2(500)
)
/

comment on column APP_USER.ID is 'UUID'
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
            references "USER" ()
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
            references "USER" (),
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

create PACKAGE pkg_sync_data AS
    FUNCTION fn_get_guilds(
        p_user_id IN VARCHAR2
    ) RETURN CLOB;

    FUNCTION fn_get_channels(
        p_user_id IN VARCHAR2
    ) RETURN CLOB;

    FUNCTION fn_get_sync_data(
        p_user_id IN VARCHAR2
    ) RETURN CLOB;
END pkg_sync_data;
/

create PACKAGE PKG_GUILD AS
    -- Public Procedures
    PROCEDURE CREATE_GUILD(P_ID IN VARCHAR2, P_NAME IN VARCHAR2, P_ICON_URL IN VARCHAR2, P_IS_PUBLIC IN NUMBER, P_OWNER_ID IN VARCHAR2);
    PROCEDURE GET_GUILD(P_ID IN VARCHAR2, CURSOR_OUT OUT SYS_REFCURSOR);
    PROCEDURE UPDATE_GUILD(
        P_ID IN VARCHAR2,
        P_FIELDS IN VARCHAR2
    );
    PROCEDURE DELETE_GUILD(P_ID IN VARCHAR2);

    -- Custom Exceptions
    GUILD_NOT_FOUND EXCEPTION;
END PKG_GUILD;
/

create PACKAGE BODY PKG_GUILD AS

    PROCEDURE CREATE_GUILD(P_ID IN VARCHAR2,P_NAME IN VARCHAR2, P_ICON_URL IN VARCHAR2, P_IS_PUBLIC IN NUMBER, P_OWNER_ID IN VARCHAR2) IS
    BEGIN
        INSERT INTO GUILD (ID, NAME, ICON_URL, IS_PUBLIC, OWNER_ID)
        VALUES (P_ID, P_NAME, P_ICON_URL, P_IS_PUBLIC, P_OWNER_ID);
    EXCEPTION
        WHEN OTHERS THEN
            -- Error when trying to create a new guild
            RAISE_APPLICATION_ERROR(-20001, 'Error creating GUILD: ' || SQLERRM);
    END CREATE_GUILD;

    PROCEDURE GET_GUILD(P_ID IN VARCHAR2, CURSOR_OUT OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN CURSOR_OUT FOR
        SELECT * FROM GUILD WHERE ID = P_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20002, 'Guild not found.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'Error while getting guild: ' || SQLERRM);
    END GET_GUILD;

    PROCEDURE UPDATE_GUILD(
        P_ID IN VARCHAR2,
        P_FIELDS IN VARCHAR2
    ) IS
        v_sql VARCHAR2(4000);
    BEGIN
        v_sql := 'UPDATE GUILD SET ' || P_FIELDS || ' WHERE ID = :1';
        EXECUTE IMMEDIATE v_sql USING P_ID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'Could not update GUILD. Guild not found for ID: ' || P_ID);
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20003, 'Error updating GUILD: ' || SQLERRM);
    END UPDATE_GUILD;


    PROCEDURE DELETE_GUILD(P_ID IN VARCHAR2) IS
    BEGIN
        DELETE FROM GUILD WHERE ID = P_ID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE GUILD_NOT_FOUND;
        END IF;
    EXCEPTION
        WHEN GUILD_NOT_FOUND THEN
            RAISE_APPLICATION_ERROR(-20006, 'Guild not found for deletion.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20007, 'Error deleting guild: ' || SQLERRM);
    END DELETE_GUILD;

END PKG_GUILD;
/

create PACKAGE PKG_USER AS
    -- Public Procedures & functions
    PROCEDURE CREATE_USER(P_ID IN VARCHAR2, P_USERNAME IN VARCHAR2, P_EMAIL IN VARCHAR2, P_IS_BOT IN NUMBER, P_AVATAR_URL IN VARCHAR2);
    PROCEDURE GET_USER(P_ID IN VARCHAR2, CURSOR_OUT OUT SYS_REFCURSOR);
    FUNCTION GET_USER_JSON(P_ID IN VARCHAR2) RETURN CLOB;
    PROCEDURE UPDATE_USER(
        P_ID IN VARCHAR2,
        P_FIELDS IN VARCHAR2
    );
    PROCEDURE DELETE_USER(P_ID IN VARCHAR2);

    -- Custom Exceptions
    USER_NOT_FOUND EXCEPTION;
END PKG_USER;
/

create PACKAGE BODY pkg_sync_data AS
    FUNCTION fn_get_guilds(
        p_user_id IN VARCHAR2
    ) RETURN CLOB IS
        v_result CLOB;
    BEGIN
        SELECT NVL(JSON_ARRAYAGG(
                           JSON_OBJECT(
                                   'id' VALUE g.id,
                                   'name' VALUE g.name,
                                   'iconUrl' VALUE g.icon_url,
                                   'isPublic' VALUE g.is_public,
                                   'ownerId' VALUE g.owner_id,
                                   'members' VALUE (SELECT JSON_ARRAYAGG(
                                                                   JSON_OBJECT(
                                                                           'userId' VALUE gu.user_id
                                                                   ) RETURNING CLOB
                                                           )
                                                    FROM guild_users gu
                                                    left join GUILD GU2 on gu.GUILD_ID = GU2.ID
                                                    WHERE gu.guild_id = g.id or GU2.OWNER_ID = p_user_id) RETURNING CLOB
                           ) RETURNING CLOB
                   ), '[]')
        INTO v_result
        FROM guild g
                 LEFT JOIN guild_users gu ON g.id = gu.guild_id
        WHERE g.owner_id = p_user_id
           OR gu.user_id = p_user_id;

        RETURN v_result;
    END fn_get_guilds;

    FUNCTION fn_get_channels(
        p_user_id IN VARCHAR2
    ) RETURN CLOB IS
        v_result CLOB;
    BEGIN
        SELECT NVL(
                       JSON_ARRAYAGG(
                               JSON_OBJECT(
                                       'id' VALUE c.id,
                                       'name' VALUE c.name,
                                       'description' VALUE c.description,
                                       'position' VALUE c.position,
                                       'guildId' VALUE c.guild_id
                               ) RETURNING CLOB
                       ),
                       '[]'
               )
        INTO v_result
        FROM channel c
                 INNER JOIN guild g ON c.guild_id = g.id
                 LEFT JOIN guild_users gu ON g.id = gu.guild_id
        WHERE g.owner_id = p_user_id
           OR gu.user_id = p_user_id;

        RETURN v_result;
    END fn_get_channels;

    FUNCTION fn_get_sync_data(
        p_user_id IN VARCHAR2
    ) RETURN CLOB IS
        v_result       CLOB;
        v_guilds       CLOB;
        v_channels     CLOB;
        v_current_user CLOB;
    BEGIN
        v_guilds := fn_get_guilds(p_user_id);
        v_channels := fn_get_channels(p_user_id);
        v_current_user := PKG_USER.GET_USER_JSON(p_user_id);

        v_result :=
                '{ "guilds": ' || v_guilds || ', "channels": ' || v_channels || ', "currentUser": ' || v_current_user ||
                '}';

        RETURN v_result;
    END fn_get_sync_data;
END pkg_sync_data;
/

create PACKAGE BODY PKG_USER AS

    PROCEDURE CREATE_USER(P_ID IN VARCHAR2, P_USERNAME IN VARCHAR2, P_EMAIL IN VARCHAR2, P_IS_BOT IN NUMBER, P_AVATAR_URL IN VARCHAR2) IS
    BEGIN
        INSERT INTO APP_USER (ID, USERNAME, EMAIL, IS_BOT, AVATAR_URL)
        VALUES (P_ID, P_USERNAME, P_EMAIL, P_IS_BOT, P_AVATAR_URL);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20101, 'Error creating USER: ' || SQLERRM);
    END CREATE_USER;

    PROCEDURE GET_USER(P_ID IN VARCHAR2, CURSOR_OUT OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN CURSOR_OUT FOR
        SELECT * FROM APP_USER WHERE ID = P_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20102, 'User not found.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20103, 'Error while getting user: ' || SQLERRM);
    END GET_USER;

    FUNCTION GET_USER_JSON(P_ID IN VARCHAR2) RETURN CLOB IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
            'id' VALUE ID,
            'username' VALUE USERNAME,
            'email' VALUE EMAIL,
           'isBot' VALUE IS_BOT,
            'avatarUrl' VALUE AVATAR_URL
        ) INTO v_json
        FROM APP_USER
        WHERE ID = P_ID;

        IF v_json IS NULL THEN
            RAISE_APPLICATION_ERROR(-20102, 'User not found.');
        END IF;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20102, 'User not found.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20108, 'Error getting user JSON: ' || SQLERRM);
    END GET_USER_JSON;

    PROCEDURE UPDATE_USER(
        P_ID IN VARCHAR2,
        P_FIELDS IN VARCHAR2
    ) IS
        v_sql VARCHAR2(4000);
    BEGIN
        v_sql := 'UPDATE APP_USER SET ' || P_FIELDS || ' WHERE ID = :1';
        EXECUTE IMMEDIATE v_sql USING P_ID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20104, 'Could not update USER. User not found for ID: ' || P_ID);
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20105, 'Error updating USER: ' || SQLERRM);
    END UPDATE_USER;

    PROCEDURE DELETE_USER(P_ID IN VARCHAR2) IS
    BEGIN
        DELETE FROM APP_USER WHERE ID = P_ID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE USER_NOT_FOUND;
        END IF;
    EXCEPTION
        WHEN USER_NOT_FOUND THEN
            RAISE_APPLICATION_ERROR(-20106, 'User not found for deletion.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20107, 'Error deleting user: ' || SQLERRM);
    END DELETE_USER;

END PKG_USER;
/

create function random_uuid return VARCHAR2 is
  v_uuid VARCHAR2(40);
begin
  select regexp_replace(rawtohex(sys_guid()), '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})', '\1-\2-\3-\4-\5') into v_uuid from dual;
  return v_uuid;
end random_uuid;
/

