/*
Error Codes Reference:
-22001: Failed to create a new message
-22002: Message not found when trying to retrieve it
-22003: Error occurred while fetching message data
-22004: Message not found when trying to update it
-22005: Error occurred while updating message data
-22006: Message not found when trying to delete it
-22007: Error occurred while deleting message data
-22008: Error occurred while fetching channel messages
*/

CREATE OR REPLACE PACKAGE PKG_MESSAGES AS
    -- Public Procedures
    PROCEDURE CREATE_MESSAGE(
        P_ID IN VARCHAR2,
        P_CONTENT IN VARCHAR2,
        P_AUTHOR_ID IN VARCHAR2,
        P_CHANNEL_ID IN VARCHAR2,
        P_CREATED_AT IN TIMESTAMP
    );

    PROCEDURE GET_MESSAGE(
        P_ID IN VARCHAR2,
        CURSOR_OUT OUT SYS_REFCURSOR
    );

    PROCEDURE GET_CHANNEL_MESSAGES(
        P_CHANNEL_ID IN VARCHAR2,
        P_LIMIT IN NUMBER DEFAULT 50,
        P_OFFSET IN NUMBER DEFAULT 0,
        CURSOR_OUT OUT SYS_REFCURSOR
    );

    PROCEDURE UPDATE_MESSAGE(
        P_ID IN VARCHAR2,
        P_CONTENT IN VARCHAR2
    );

    PROCEDURE DELETE_MESSAGE(
        P_ID IN VARCHAR2
    );

    -- Custom Exceptions
    MESSAGE_NOT_FOUND EXCEPTION;
END PKG_MESSAGES;
/

CREATE OR REPLACE PACKAGE BODY PKG_MESSAGES AS

    PROCEDURE CREATE_MESSAGE(
        P_ID IN VARCHAR2,
        P_CONTENT IN VARCHAR2,
        P_AUTHOR_ID IN VARCHAR2,
        P_CHANNEL_ID IN VARCHAR2,
        P_CREATED_AT IN TIMESTAMP
    ) IS
    BEGIN
        INSERT INTO MESSAGE (ID, CONTENT, AUTHOR_ID, CHANNEL_ID, CREATED_AT)
        VALUES (P_ID, P_CONTENT, P_AUTHOR_ID, P_CHANNEL_ID, P_CREATED_AT);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error creating MESSAGE: ' || SQLERRM);
    END CREATE_MESSAGE;   
    
    PROCEDURE GET_MESSAGE(
        P_ID IN VARCHAR2,
        CURSOR_OUT OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN CURSOR_OUT FOR
            SELECT M.*
            FROM MESSAGE M
            WHERE M.ID = P_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-22002, 'Message not found.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-22003, 'Error while getting message: ' || SQLERRM);
    END GET_MESSAGE;

    PROCEDURE GET_CHANNEL_MESSAGES(
        P_CHANNEL_ID IN VARCHAR2,
        P_LIMIT IN NUMBER DEFAULT 50,
        P_OFFSET IN NUMBER DEFAULT 0,
        CURSOR_OUT OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN CURSOR_OUT FOR
            SELECT M.*, U.USERNAME AS AUTHOR_USERNAME, U.AVATAR_URL AS AUTHOR_AVATAR
            FROM (
                SELECT a.*, ROWNUM rnum
                FROM (
                    SELECT *
                    FROM MESSAGE
                    WHERE CHANNEL_ID = P_CHANNEL_ID
                    ORDER BY ID DESC
                ) a WHERE ROWNUM <= P_OFFSET + P_LIMIT
            ) M
            JOIN APP_USER U ON M.AUTHOR_ID = U.ID
            WHERE rnum > P_OFFSET
            ORDER BY M.ID DESC;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-22008, 'Error while getting channel messages: ' || SQLERRM);
    END GET_CHANNEL_MESSAGES;

    PROCEDURE UPDATE_MESSAGE(
        P_ID IN VARCHAR2,
        P_CONTENT IN VARCHAR2
    ) IS
    BEGIN
        UPDATE MESSAGE
        SET CONTENT = P_CONTENT
        WHERE ID = P_ID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE MESSAGE_NOT_FOUND;
        END IF;
    EXCEPTION
        WHEN MESSAGE_NOT_FOUND THEN
            RAISE_APPLICATION_ERROR(-22004, 'Could not update MESSAGE. Message not found for ID: ' || P_ID);
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-22005, 'Error updating MESSAGE: ' || SQLERRM);
    END UPDATE_MESSAGE;

    PROCEDURE DELETE_MESSAGE(
        P_ID IN VARCHAR2
    ) IS
    BEGIN
        DELETE FROM MESSAGE WHERE ID = P_ID;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE MESSAGE_NOT_FOUND;
        END IF;
    EXCEPTION
        WHEN MESSAGE_NOT_FOUND THEN
            RAISE_APPLICATION_ERROR(-22006, 'Message not found for deletion.');
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-22007, 'Error deleting message: ' || SQLERRM);
    END DELETE_MESSAGE;

END PKG_MESSAGES;
/