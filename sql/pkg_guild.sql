/*
Error Codes Reference:
-20001: Failed to create a new guild
-20002: Guild not found when trying to retrieve it
-20003: Error occurred while fetching guild data
-20004: Guild not found when trying to update it
-20005: Error occurred while updating guild data
-20006: Guild not found when trying to delete it
-20007: Error occurred while deleting guild data
*/

CREATE OR REPLACE PACKAGE PKG_GUILD AS
    -- Public Procedures
    PROCEDURE CREATE_GUILD(P_ID IN VARCHAR2, P_NAME IN VARCHAR2, P_ICON_URL IN VARCHAR2, P_IS_PUBLIC IN NUMBER, P_OWNER_ID IN VARCHAR2);
    PROCEDURE GET_GUILD(P_ID IN VARCHAR2, CURSOR_OUT OUT SYS_REFCURSOR);
    PROCEDURE UPDATE_GUILD(
        P_ID IN VARCHAR2,
        P_FIELDS IN VARCHAR2
    );
    PROCEDURE DELETE_GUILD(P_ID IN VARCHAR2);
    PROCEDURE GET_PUBLIC_GUILDS(CURSOR_OUT OUT SYS_REFCURSOR);

    -- Custom Exceptions
    GUILD_NOT_FOUND EXCEPTION;
END PKG_GUILD;
/

CREATE OR REPLACE PACKAGE BODY PKG_GUILD AS

    PROCEDURE GET_PUBLIC_GUILDS(
        CURSOR_OUT OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN CURSOR_OUT FOR
            SELECT G.*
            FROM GUILD G
            WHERE G.IS_PUBLIC = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20008, 'No public guilds found.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20009, 'Error while getting public guilds: ' || SQLERRM);
    END GET_PUBLIC_GUILDS;

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
