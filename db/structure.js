export default `
create table if not exists translations
(
    id         serial                                             not null,
    key        text                                               not null,
    value      text                                               not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint translations_pk
        primary key (id),
    constraint translations_key
        unique (key)
);

create unique index if not exists translations_key_uindex
    on translations (key);

create table if not exists images
(
    id         serial                                             not null,
    creator_id integer                                            not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    name       text                                               not null,
    constraint images_pk
        primary key (id)
);

create table if not exists image_variations
(
    id        serial              not null,
    name      text                not null,
    path      text                not null,
    width     integer             not null,
    height    integer             not null,
    image_id  integer             not null,
    mime_type varchar default 127 not null,
    constraint image_variations_pk
        primary key (id),
    constraint image_variations_images_id_fk
        foreign key (image_id) references images
            on update cascade on delete cascade
);

create unique index if not exists image_variations_path_uindex
    on image_variations (path);

create table if not exists news
(
    id          serial                                             not null,
    slug        text                                               not null,
    title       text                                               not null,
    description text                                               not null,
    content     text                                               not null,
    image_id    integer                                            not null,
    creator_id  integer                                            not null,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    date        date                     default CURRENT_TIMESTAMP not null,
    constraint news_pk
        primary key (id),
    constraint news_images_id_fk
        foreign key (image_id) references images
);

create unique index if not exists news_slug_uindex
    on news (slug);
`;
