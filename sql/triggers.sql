CREATE OR REPLACE TRIGGER trg_guild_add_owner
AFTER INSERT ON GUILD
FOR EACH ROW
BEGIN
    -- Insert the owner as a member of the guild
    INSERT INTO GUILD_USERS (GUILD_ID, USER_ID)
    VALUES (:NEW.ID, :NEW.OWNER_ID);
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20301, 'Error adding owner to guild members: ' || SQLERRM);
END;
/

--APP_USER--
CREATE OR REPLACE TRIGGER TRG_AUD_APP_USER
AFTER INSERT OR UPDATE OR DELETE ON APP_USER
FOR EACH ROW
DECLARE
    v_valor_antes   CLOB;
    v_valor_despues CLOB;
    v_operacion     VARCHAR2(10);
    v_llave         VARCHAR2(36);
BEGIN
    IF INSERTING THEN
        v_operacion := 'INSERT';
        v_llave := :NEW.ID;
    ELSIF UPDATING THEN
        v_operacion := 'UPDATE';
        v_llave := :NEW.ID;
    ELSIF DELETING THEN
        v_operacion := 'DELETE';
        v_llave := :OLD.ID;
    END IF;

    IF DELETING OR UPDATING THEN
        v_valor_antes := TO_CLOB(
            '{"id":"' || :OLD.ID || '", "username":"' || :OLD.USERNAME || 
            '", "email":"' || :OLD.EMAIL || '", "isBot":' || :OLD.IS_BOT ||
            ', "avatarUrl":"' || :OLD.AVATAR_URL || '"}'
        );
    END IF;

    IF INSERTING OR UPDATING THEN
        v_valor_despues := TO_CLOB(
            '{"id":"' || :NEW.ID || '", "username":"' || :NEW.USERNAME || 
            '", "email":"' || :NEW.EMAIL || '", "isBot":' || :NEW.IS_BOT ||
            ', "avatarUrl":"' || :NEW.AVATAR_URL || '"}'
        );
    END IF;

    INSERT INTO AUDITORIA (
        TABLA, OPERACION, USUARIO_BD, USUARIO_APP, FECHA_ACCION, LLAVE_PRIMARIA, VALOR_ANTES, VALOR_DESPUES
    ) VALUES (
        'APP_USER',
        v_operacion,
        SYS_CONTEXT('USERENV','SESSION_USER'),
        SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER'),
        SYSTIMESTAMP,
        v_llave,
        v_valor_antes,
        v_valor_despues
    );

END;
/


--GUILD--
CREATE OR REPLACE TRIGGER TRG_AUD_GUILD
AFTER INSERT OR UPDATE OR DELETE ON GUILD
FOR EACH ROW
DECLARE
    v_valor_antes   CLOB;
    v_valor_despues CLOB;
    v_operacion     VARCHAR2(10);
    v_llave         VARCHAR2(36);
BEGIN
    IF INSERTING THEN
        v_operacion := 'INSERT';
        v_llave := :NEW.ID;
    ELSIF UPDATING THEN
        v_operacion := 'UPDATE';
        v_llave := :NEW.ID;
    ELSIF DELETING THEN
        v_operacion := 'DELETE';
        v_llave := :OLD.ID;
    END IF;

    IF DELETING OR UPDATING THEN
        v_valor_antes := TO_CLOB(
            '{"id":"' || :OLD.ID || '", "name":"' || :OLD.NAME ||
            '", "iconUrl":"' || :OLD.ICON_URL || '", "isPublic":' || :OLD.IS_PUBLIC ||
            ', "ownerId":"' || :OLD.OWNER_ID || '"}'
        );
    END IF;

    IF INSERTING OR UPDATING THEN
        v_valor_despues := TO_CLOB(
            '{"id":"' || :NEW.ID || '", "name":"' || :NEW.NAME ||
            '", "iconUrl":"' || :NEW.ICON_URL || '", "isPublic":' || :NEW.IS_PUBLIC ||
            ', "ownerId":"' || :NEW.OWNER_ID || '"}'
        );
    END IF;

    INSERT INTO AUDITORIA (
        TABLA, OPERACION, USUARIO_BD, USUARIO_APP, FECHA_ACCION, LLAVE_PRIMARIA, VALOR_ANTES, VALOR_DESPUES
    ) VALUES (
        'GUILD',
        v_operacion,
        SYS_CONTEXT('USERENV','SESSION_USER'),
        SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER'),
        SYSTIMESTAMP,
        v_llave,
        v_valor_antes,
        v_valor_despues
    );
END;
/

--GUILD_USERS--
CREATE OR REPLACE TRIGGER TRG_AUD_GUILD_USERS
AFTER INSERT OR UPDATE OR DELETE ON GUILD_USERS
FOR EACH ROW
DECLARE
    v_valor_antes   CLOB;
    v_valor_despues CLOB;
    v_operacion     VARCHAR2(10);
    v_llave         VARCHAR2(200);
BEGIN
    IF INSERTING THEN
        v_operacion := 'INSERT';
        v_llave := :NEW.GUILD_ID || '-' || :NEW.USER_ID;
    ELSIF UPDATING THEN
        v_operacion := 'UPDATE';
        v_llave := :NEW.GUILD_ID || '-' || :NEW.USER_ID;
    ELSIF DELETING THEN
        v_operacion := 'DELETE';
        v_llave := :OLD.GUILD_ID || '-' || :OLD.USER_ID;
    END IF;

    IF DELETING OR UPDATING THEN
        v_valor_antes := TO_CLOB(
            '{"guildId":"' || :OLD.GUILD_ID || '", "userId":"' || :OLD.USER_ID || '"}'
        );
    END IF;

    IF INSERTING OR UPDATING THEN
        v_valor_despues := TO_CLOB(
            '{"guildId":"' || :NEW.GUILD_ID || '", "userId":"' || :NEW.USER_ID || '"}'
        );
    END IF;

    INSERT INTO AUDITORIA (
        TABLA, OPERACION, USUARIO_BD, USUARIO_APP, FECHA_ACCION, LLAVE_PRIMARIA, VALOR_ANTES, VALOR_DESPUES
    ) VALUES (
        'GUILD_USERS',
        v_operacion,
        SYS_CONTEXT('USERENV','SESSION_USER'),
        SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER'),
        SYSTIMESTAMP,
        v_llave,
        v_valor_antes,
        v_valor_despues
    );
END;
/

--CHANNEL--
CREATE OR REPLACE TRIGGER TRG_AUD_CHANNEL
AFTER INSERT OR UPDATE OR DELETE ON CHANNEL
FOR EACH ROW
DECLARE
    v_valor_antes   CLOB;
    v_valor_despues CLOB;
    v_operacion     VARCHAR2(10);
    v_llave         VARCHAR2(36);
BEGIN
    IF INSERTING THEN
        v_operacion := 'INSERT';
        v_llave := :NEW.ID;
    ELSIF UPDATING THEN
        v_operacion := 'UPDATE';
        v_llave := :NEW.ID;
    ELSIF DELETING THEN
        v_operacion := 'DELETE';
        v_llave := :OLD.ID;
    END IF;

    IF DELETING OR UPDATING THEN
        v_valor_antes := TO_CLOB(
            '{"id":"' || :OLD.ID || '", "name":"' || :OLD.NAME ||
            '", "description":"' || :OLD.DESCRIPTION || '", "position":' || :OLD.POSITION ||
            ', "guildId":"' || :OLD.GUILD_ID || '"}'
        );
    END IF;

    IF INSERTING OR UPDATING THEN
        v_valor_despues := TO_CLOB(
            '{"id":"' || :NEW.ID || '", "name":"' || :NEW.NAME ||
            '", "description":"' || :NEW.DESCRIPTION || '", "position":' || :NEW.POSITION ||
            ', "guildId":"' || :NEW.GUILD_ID || '"}'
        );
    END IF;

    INSERT INTO AUDITORIA (
        TABLA, OPERACION, USUARIO_BD, USUARIO_APP, FECHA_ACCION, LLAVE_PRIMARIA, VALOR_ANTES, VALOR_DESPUES
    ) VALUES (
        'CHANNEL',
        v_operacion,
        SYS_CONTEXT('USERENV','SESSION_USER'),
        SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER'),
        SYSTIMESTAMP,
        v_llave,
        v_valor_antes,
        v_valor_despues
    );
END;
/

--MESSAGE--
CREATE OR REPLACE TRIGGER TRG_AUD_MESSAGE
AFTER INSERT OR UPDATE OR DELETE ON MESSAGE
FOR EACH ROW
DECLARE
    v_valor_antes   CLOB;
    v_valor_despues CLOB;
    v_operacion     VARCHAR2(10);
    v_llave         VARCHAR2(36);
BEGIN
    IF INSERTING THEN
        v_operacion := 'INSERT';
        v_llave := :NEW.ID;
    ELSIF UPDATING THEN
        v_operacion := 'UPDATE';
        v_llave := :NEW.ID;
    ELSIF DELETING THEN
        v_operacion := 'DELETE';
        v_llave := :OLD.ID;
    END IF;

    IF DELETING OR UPDATING THEN
        v_valor_antes := TO_CLOB(
            '{"id":"' || :OLD.ID || '", "content":"' || :OLD.CONTENT ||
            '", "authorId":"' || :OLD.AUTHOR_ID || '", "channelId":"' || :OLD.CHANNEL_ID ||
            '", "createdAt":"' || TO_CHAR(:OLD.CREATED_AT, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') || '"}'
        );
    END IF;

    IF INSERTING OR UPDATING THEN
        v_valor_despues := TO_CLOB(
            '{"id":"' || :NEW.ID || '", "content":"' || :NEW.CONTENT ||
            '", "authorId":"' || :NEW.AUTHOR_ID || '", "channelId":"' || :NEW.CHANNEL_ID ||
            '", "createdAt":"' || TO_CHAR(:NEW.CREATED_AT, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') || '"}'
        );
    END IF;

    INSERT INTO AUDITORIA (
        TABLA, OPERACION, USUARIO_BD, USUARIO_APP, FECHA_ACCION, LLAVE_PRIMARIA, VALOR_ANTES, VALOR_DESPUES
    ) VALUES (
        'MESSAGE',
        v_operacion,
        SYS_CONTEXT('USERENV','SESSION_USER'),
        SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER'),
        SYSTIMESTAMP,
        v_llave,
        v_valor_antes,
        v_valor_despues
    );
END;
/