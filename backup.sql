create table "user"
(
    id              uuid      default uuid_generate_v4() not null
        constraint user_pk
            primary key,
    name            varchar                              not null,
    email           varchar                              not null,
    hashed_password varchar                              not null,
    created_at      timestamp default CURRENT_TIMESTAMP  not null,
    updated_at      timestamp
);

alter table "user"
    owner to postgres;

create table channel
(
    id          uuid      default uuid_generate_v4() not null
        constraint channel_pk
            primary key,
    name        varchar                              not null,
    description varchar                              not null,
    created_at  timestamp default CURRENT_TIMESTAMP  not null,
    updated_at  timestamp,
    owner_id    uuid                                 not null
        constraint channel_user_id_fk
            references "user"
);

alter table channel
    owner to postgres;

create table message
(
    id         uuid      default uuid_generate_v4() not null
        constraint message_pk
            primary key,
    author_id  uuid                                 not null
        constraint message_user_id_fk
            references "user",
    content    varchar                              not null,
    created_at timestamp default CURRENT_TIMESTAMP  not null,
    updated_at timestamp,
    channel_id uuid                                 not null
        constraint channel_id_fk
            references channel
);

alter table message
    owner to postgres;

create table user_channel
(
    user_id    uuid                                not null
        constraint user_channel_user_id_fk
            references "user",
    channel_id uuid                                not null
        constraint user_channel_channel_id_fk
            references channel,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    constraint user_channel_pk
        primary key (user_id, channel_id)
);

alter table user_channel
    owner to postgres;

create function uuid_nil() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_nil() owner to postgres;

create function uuid_ns_dns() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_ns_dns() owner to postgres;

create function uuid_ns_url() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_ns_url() owner to postgres;

create function uuid_ns_oid() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_ns_oid() owner to postgres;

create function uuid_ns_x500() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_ns_x500() owner to postgres;

create function uuid_generate_v1() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v1() owner to postgres;

create function uuid_generate_v1mc() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v1mc() owner to postgres;

create function uuid_generate_v3(namespace uuid, name text) returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v3(uuid, text) owner to postgres;

create function uuid_generate_v4() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v4() owner to postgres;

create function uuid_generate_v5(namespace uuid, name text) returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function uuid_generate_v5(uuid, text) owner to postgres;

