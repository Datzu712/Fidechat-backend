/*
Error Codes Reference:
-21001: Failed to create a new channel
-21002: Channel not found when trying to retrieve it
-21003: Error occurred while fetching channel data
-21004: Channel not found when trying to update it
-21005: Error occurred while updating channel data
-21006: Channel not found when trying to delete it
-21007: Error occurred while deleting channel data
*/

CREATE OR REPLACE PACKAGE PKG_CHANNEL AS
    -- Public Procedures
    PROCEDURE CREATE_CHANNEL(P_ID IN VARCHAR2, P_NAME IN VARCHAR2, P_DESCRIPTION IN VARCHAR2, P_POSITION IN NUMBER, P_GUILD_ID IN VARCHAR2);
    PROCEDURE GET_CHANNEL(P_ID IN VARCHAR2, CURSOR_OUT OUT SYS_REFCURSOR);
    PROCEDURE UPDATE_CHANNEL(
        P_ID IN VARCHAR2,
        P_FIELDS IN VARCHAR2
    );
    PROCEDURE DELETE_CHANNEL(P_ID IN VARCHAR2);

    -- Custom Exceptions
    CHANNEL_NOT_FOUND EXCEPTION;
END PKG_CHANNEL;
/

CREATE OR REPLACE PACKAGE BODY PKG_CHANNEL AS

    PROCEDURE CREATE_CHANNEL(P_ID IN VARCHAR2, P_NAME IN VARCHAR2, P_DESCRIPTION IN VARCHAR2, P_POSITION IN NUMBER, P_GUILD_ID IN VARCHAR2) IS
    BEGIN
        INSERT INTO CHANNEL (ID, NAME, DESCRIPTION, POSITION, GUILD_ID)
        VALUES (P_ID, P_NAME, P_DESCRIPTION, P_POSITION, P_GUILD_ID);
    EXCEPTION
        WHEN OTHERS THEN
            -- Error when trying to create a new channel
            RAISE_APPLICATION_ERROR(-21001, 'Error creating CHANNEL: ' || SQLERRM);
    END CREATE_CHANNEL;

    PROCEDURE GET_CHANNEL(P_ID IN VARCHAR2, CURSOR_OUT OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN CURSOR_OUT FOR
        SELECT * FROM CHANNEL WHERE ID = P_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-21002, 'Channel not found.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-21003, 'Error while getting channel: ' || SQLERRM);
    END GET_CHANNEL;

    PROCEDURE UPDATE_CHANNEL(
        P_ID IN VARCHAR2,
        P_FIELDS IN VARCHAR2
    ) IS
        v_sql VARCHAR2(4000);
    BEGIN
        v_sql := 'UPDATE CHANNEL SET ' || P_FIELDS || ' WHERE ID = :1';
        EXECUTE IMMEDIATE v_sql USING P_ID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-21002, 'Could not update CHANNEL. Channel not found for ID: ' || P_ID);
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-21005, 'Error updating CHANNEL: ' || SQLERRM);
    END UPDATE_CHANNEL;

    PROCEDURE DELETE_CHANNEL(P_ID IN VARCHAR2) IS
    BEGIN
        DELETE FROM CHANNEL WHERE ID = P_ID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE CHANNEL_NOT_FOUND;
        END IF;
    EXCEPTION
        WHEN CHANNEL_NOT_FOUND THEN
            RAISE_APPLICATION_ERROR(-21006, 'Channel not found for deletion.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-21007, 'Error deleting channel: ' || SQLERRM);
    END