CREATE OR REPLACE PACKAGE PKG_USER AS
    -- Public Procedures & functions
    PROCEDURE CREATE_USER(P_ID IN VARCHAR2, P_USERNAME IN VARCHAR2, P_EMAIL IN VARCHAR2, P_IS_BOT IN NUMBER, P_AVATAR_URL IN VARCHAR2);
    PROCEDURE GET_USER(P_ID IN VARCHAR2, CURSOR_OUT OUT SYS_REFCURSOR);
    FUNCTION GET_USER_JSON(P_ID IN VARCHAR2) RETURN CLOB;
    PROCEDURE UPDATE_USER(
        P_ID IN VARCHAR2,
        P_FIELDS IN VARCHAR2
    );
    PROCEDURE DELETE_USER(P_ID IN VARCHAR2);
    PROCEDURE SP_UPSERT_USER(
        p_id IN VARCHAR2,
        p_username IN VARCHAR2,
        p_email IN VARCHAR2,
        p_avatar_url IN VARCHAR2,
        p_default_guild_id IN VARCHAR2 DEFAULT NULL,
        was_added_to_guild OUT NUMBER,
        guild_id OUT VARCHAR2
    );

    -- Custom Exceptions
    USER_NOT_FOUND EXCEPTION;
END PKG_USER;
/

CREATE OR REPLACE PACKAGE BODY PKG_USER AS

    PROCEDURE SP_UPSERT_USER(
        p_id IN VARCHAR2,
        p_username IN VARCHAR2,
        p_email IN VARCHAR2,
        p_avatar_url IN VARCHAR2,
        p_default_guild_id IN VARCHAR2 DEFAULT NULL,
        was_added_to_guild OUT NUMBER,
        guild_id OUT VARCHAR2
    )
    IS
        v_exists NUMBER;
    BEGIN
        was_added_to_guild := 0;
        guild_id := NULL;

        MERGE INTO APP_USER target
        USING (SELECT p_id as id, p_username as username, p_email as email, p_avatar_url as avatar_url FROM dual) source
        ON (target.id = source.id)
        WHEN MATCHED THEN
            UPDATE SET
                username = source.username,
                email = source.email,
                avatar_url = source.avatar_url
        WHEN NOT MATCHED THEN
            INSERT (id, username, email, avatar_url)
            VALUES (source.id, source.username, source.email, source.avatar_url);

        IF p_default_guild_id IS NOT NULL THEN
            SELECT COUNT(*) INTO v_exists
            FROM GUILD_USERS
            WHERE USER_ID = p_id AND GUILD_ID = p_default_guild_id;

            IF v_exists = 0 THEN
                INSERT INTO GUILD_USERS(GUILD_ID, USER_ID)
                VALUES (p_default_guild_id, p_id);

                was_added_to_guild := 1;
                guild_id := p_default_guild_id;
            END IF;
        END IF;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END SP_UPSERT_USER;

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