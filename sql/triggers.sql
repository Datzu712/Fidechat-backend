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