CREATE OR REPLACE PACKAGE pkg_sync_data AS
    FUNCTION fn_get_guilds_json(p_user_id IN VARCHAR2) RETURN CLOB;
    FUNCTION fn_get_related_users_json(p_user_id IN VARCHAR2) RETURN CLOB;
    FUNCTION fn_get_channels_json(p_user_id IN VARCHAR2) RETURN CLOB;
    FUNCTION fn_get_sync_data(p_user_id IN VARCHAR2) RETURN CLOB;
END pkg_sync_data;
/

CREATE OR REPLACE PACKAGE BODY pkg_sync_data AS

    FUNCTION fn_get_guilds_json(p_user_id IN VARCHAR2) RETURN CLOB IS
        v_result CLOB;
    BEGIN
        SELECT NVL(
                       JSON_ARRAYAGG(
                               JSON_OBJECT(
                                       'id' VALUE g.id,
                                       'name' VALUE g.name,
                                       'iconUrl' VALUE g.icon_url,
                                       'isPublic' VALUE g.is_public,
                                       'description' VALUE g.description,
                                       'ownerId' VALUE g.owner_id,
                                       'members' VALUE (SELECT JSON_ARRAYAGG(
                                                                       JSON_OBJECT(
                                                                               'userId' VALUE gu.user_id
                                                                       ) RETURNING CLOB
                                                               )
                                                        FROM guild_users gu
                                                        WHERE gu.guild_id = g.id) RETURNING CLOB
                               ) RETURNING CLOB
                       ), TO_CLOB('[]'))
        INTO v_result
        FROM guild g
                 LEFT JOIN guild_users gu ON g.id = gu.guild_id
        WHERE gu.user_id = p_user_id;

        RETURN v_result;
    END fn_get_guilds_json;

    FUNCTION fn_get_related_users_json(p_user_id IN VARCHAR2) RETURN CLOB IS
        v_result CLOB;
    BEGIN
        SELECT NVL(
                       JSON_ARRAYAGG(
                               JSON_OBJECT(
                                       'id' VALUE id,
                                       'username' VALUE username,
                                       'avatarUrl' VALUE AVATAR_URL
                               ) RETURNING CLOB
                       ), TO_CLOB('[]'))
        INTO v_result
        FROM (SELECT u.id, u.username, u.avatar_url
              FROM app_user u
                       JOIN guild_users gu ON u.id = gu.user_id
              WHERE gu.guild_id IN (SELECT guild_id
                                    FROM guild_users
                                    WHERE user_id = p_user_id)
                AND u.id <> p_user_id
              GROUP BY u.id, u.username, u.avatar_url);

        RETURN v_result;
    END fn_get_related_users_json;

    FUNCTION fn_get_channels_json(p_user_id IN VARCHAR2) RETURN CLOB IS
        v_result CLOB;
    BEGIN
        SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                               'id' VALUE c.id,
                               'name' VALUE c.name,
                               'description' VALUE c.description,
                               'position' VALUE c.position,
                               'guildId' VALUE c.guild_id,
                             'messages' VALUE (
             SELECT JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id' VALUE m.id,
                 'content' VALUE m.content,
                 'authorId' VALUE m.author_id,
                 'createdAt' VALUE m.created_at
               ) RETURNING CLOB
             )
             FROM message m
             WHERE m.channel_id = c.id
           ) RETURNING CLOB
                       ) RETURNING CLOB
               )
        INTO v_result
        FROM channel c
                 INNER JOIN guild g ON c.guild_id = g.id
                 LEFT JOIN guild_users gu ON g.id = gu.guild_id
        WHERE gu.user_id = p_user_id;

        RETURN COALESCE(v_result, TO_CLOB('[]'));
    END fn_get_channels_json;

    FUNCTION fn_get_sync_data(p_user_id IN VARCHAR2) RETURN CLOB IS
        v_guilds       CLOB;
        v_channels     CLOB;
        v_current_user CLOB;
        v_users        CLOB;
        v_result       CLOB;
    BEGIN
        v_guilds := fn_get_guilds_json(p_user_id);
        v_channels := fn_get_channels_json(p_user_id);
        v_current_user := pkg_user.get_user_json(p_user_id);
        v_users := fn_get_related_users_json(p_user_id);

        v_result := '{'
            || '"guilds":' || v_guilds || ','
            || '"channels":' || v_channels || ','
            || '"currentUser":' || v_current_user || ','
            || '"users":' || v_users
            || '}';

        RETURN v_result;
    END fn_get_sync_data;

END pkg_sync_data;
/

ALTER PACKAGE ADMIN.PKG_SYNC_DATA COMPILE BODY;

select pkg_sync_data.fn_get_sync_data('8ad4726e-aba1-4e5d-ae88-d245d9a6c7b8')
from dual;