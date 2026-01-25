CREATE DATABASE keycloak; -- fidechat database should be created by default in compose file

\c fidechat;

CREATE TABLE "user" (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username    varchar(255) NOT NULL,
    email       varchar(255) NOT NULL,
    is_bot      boolean NOT NULL DEFAULT false,
    avatar_url  varchar(500),
    CHECK (char_length(username) > 0)
);


CREATE TABLE guild (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(100) NOT NULL,
    icon_url    varchar(500),
    is_public   boolean DEFAULT false,
    owner_id    uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    description varchar(300)
);

CREATE TABLE guild_users (
    guild_id uuid NOT NULL REFERENCES guild(id) ON DELETE CASCADE,
    user_id  uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE channel (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(100) NOT NULL,
    description varchar(500),
    position    integer NOT NULL DEFAULT 0,
    guild_id    uuid NOT NULL REFERENCES guild(id) ON DELETE CASCADE
);


CREATE TABLE message (
    id          uuid PRIMARY KEY,
    content     varchar(2000) NOT NULL,
    author_id   uuid NOT NULL REFERENCES "user"(id),
    channel_id  uuid NOT NULL REFERENCES channel(id) ON DELETE CASCADE,
    created_at  timestamp NOT NULL DEFAULT now(),
    updated_at  timestamp NOT NULL DEFAULT now()
);


CREATE INDEX idx_guild_users_user_id ON guild_users(user_id);
CREATE INDEX idx_guild_users_guild_id ON guild_users(guild_id);

CREATE INDEX idx_channel_guild_id ON channel(guild_id);

CREATE INDEX idx_message_channel_id ON message(channel_id);
CREATE INDEX idx_message_created_at ON message(created_at DESC);
