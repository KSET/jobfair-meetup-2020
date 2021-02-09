export const base = `
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
    id        serial       not null,
    name      text         not null,
    path      text         not null,
    width     integer      not null,
    height    integer      not null,
    image_id  integer      not null,
    mime_type varchar(127) not null,
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

create table if not exists files
(
    id          serial                                             not null,
    name        varchar(255)                                       not null,
    size        integer                                            not null,
    hash        varchar(511)                                       not null,
    uploader_id integer                                            not null,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    path        text                                               not null,
    mime_type   varchar(127)                                       not null,
    constraint files_pk
        primary key (id)
);

create index if not exists uploads_hash_index
    on files (hash);

create index if not exists uploads_name_index
    on files (name);

create unique index if not exists files_path_uindex
    on files (path);

create table if not exists press_release
(
    id         serial                                             not null,
    title      text                                               not null,
    file_id    integer                                            not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint press_release_pk
        primary key (id),
    constraint press_release_files_id_fk
        foreign key (file_id) references files
);

create table if not exists press_gallery
(
    id          serial                                             not null,
    title       text                                               not null,
    description text                                               not null,
    image_id    integer                                            not null,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint press_gallery_pk
        primary key (id)
);

create table if not exists settings
(
    id    serial       not null,
    key   varchar(255) not null,
    value text         not null,
    constraint settings_pk
        primary key (id)
);

create unique index if not exists settings_key_uindex
    on settings (key);

create table if not exists db_versions
(
    id      serial                                             not null,
    "name"  varchar(255)                                       not null,
    date    timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint db_versions_pk
        primary key (id)
);

create unique index if not exists db_versions_name_uindex
    on db_versions (name);

create table if not exists press_kit
(
    id           serial                                           not null,
    title        text                                             not null,
    file_id      integer                                          not null,
    image_id     integer                                          not null,
    "order"      integer                                          not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint press_kit_pk
        primary key (id),
    constraint press_kit_files_id_fk
        foreign key (file_id) references files
            on update cascade on delete cascade,
    constraint press_kit_images_id_fk
        foreign key (image_id) references images
            on update cascade on delete cascade
);

create table if not exists event_reservations
(
    id         serial                                             not null
        constraint event_reservations_pk
            primary key,
    event_id   integer                                            not null,
    user_id    integer,
    status     integer                                            not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null
);

create unique index if not exists event_reservations_event_id_user_id_uindex
    on event_reservations (event_id, user_id);

create index if not exists event_reservations_user_id_index
    on event_reservations (user_id);

create table if not exists panels
(
    id         serial                                             not null
        constraint talks_pk
            primary key,
    description text                                              not null,
    title      text                                               not null,
    occures_at timestamp with time zone                           not null,
    companies  json                                               not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null
);

create table if not exists resume_favourites
(
    company_id integer not null,
    resume_id  integer not null,
    constraint resume_favourites_pk
        unique (company_id, resume_id)
);

create index if not exists resume_favourites_company_id_index
    on resume_favourites (company_id);

create table if not exists resume_scans
(
    company_id integer not null,
    resume_id  integer not null,
    scanned_at timestamp with time zone default CURRENT_TIMESTAMP,
    constraint resume_scans_pk
        unique (company_id, resume_id)
);

create index if not exists resume_scans_company_id_index
    on resume_scans (company_id);

create table if not exists event_log_entries
(
    user_id    integer                                            not null,
    event_id   integer                                            not null,
    event_type varchar(255)                                       not null,
    scanner_id integer                                            not null,
    scanned_at timestamp with time zone default CURRENT_TIMESTAMP not null
);

create index if not exists event_log_entries_user_id_event_id_event_type_index
    on event_log_entries (user_id, event_id, event_type);

create index if not exists event_log_entries_event_id_event_type_index
    on event_log_entries (event_id, event_type);

create table if not exists media_partners
(
    id       serial       not null
        constraint media_partners_pk
            primary key,
    name     varchar(255) not null,
    link     varchar(511) not null,
    "order"  integer default 0,
    image_id integer      not null
        constraint media_partners_images_id_fk
            references images
);

create table if not exists project_friends
(
    id       serial       not null
        constraint project_friends_pk
            primary key,
    name     varchar(255) not null,
    link     varchar(511) not null,
    "order"  integer default 0,
    image_id integer      not null
        constraint project_friends_images_id_fk
            references images
);

create table if not exists company_applications_workshops
(
    id serial not null
        constraint company_applications_workshops_pk
            primary key,
    title varchar(511) not null,
    description varchar(511) not null,
    goal varchar(511) not null,
    biography text not null,
    notes text,
    created_at timestamptz default CURRENT_TIMESTAMP not null
);

create table if not exists company_applications_talks
(
    id serial not null
        constraint company_applications_talks_pk
            primary key,
    title varchar(511) not null,
    description varchar(511) not null,
    topic int not null,
    presenter_photo_id int not null
        constraint company_applications_talks_images_id_fk
            references images
                on update cascade on delete cascade,
    presenter_description varchar(511) not null,
    created_at timestamptz default CURRENT_TIMESTAMP not null
);

create table if not exists company_applications
(
    id serial not null
        constraint company_applications_pk
            primary key,
    oib varchar(127) not null,
    legal_name varchar(511) not null,
    brand_name varchar(511) not null,
    address varchar(511) not null,
    industry_id int not null,
    description varchar(511) not null,
    website varchar(511) not null,
    logo_image_id int not null
        constraint company_applications_images_id_fk
            references images
                on update cascade on delete cascade,
    vector_logo_file_id int not null
        constraint company_applications_files_id_fk
            references files,
    talk_id int
        constraint company_applications_company_applications_talks_id_fk
            references company_applications_talks
                on update cascade on delete cascade,
    workshop_id int
        constraint company_applications_company_applications_workshops_id_fk
            references company_applications_workshops
                on update cascade on delete cascade,
    panel_interested bool default false not null,
    created_at timestamptz default CURRENT_TIMESTAMP not null
);
`;


export const versions = [
  {
    name: "start",
    up: `
    alter table
      press_gallery
    add
      "order"
      integer
      default 0
      not null
    ;

    update
      press_gallery
    set
      "order" = id
    ;
  `,
    down: `
    alter table
      press_gallery
    drop column
      "order"
    ;
  `,
  },
  {
    name: "event-reservation-add-event-type",
    up: `
    alter table
      event_reservations
    add
      "event_type"
      varchar(255)
      default 'talk'
      not null
    ;

    drop index if exists event_reservations_event_id_user_id_uindex;

    create unique index if not exists event_reservations_event_id_user_id_event_type_uindex
      on event_reservations (event_id, event_type, user_id);
  `,
    down: `
    alter table
      event_reservations
    drop column
      "event_type"
    ;

    create unique index if not exists event_reservations_event_id_user_id_uindex
      on event_reservations (event_id, user_id);

    drop index if exists event_reservations_event_id_user_id_event_type_uindex;
  `,
  },
  {
    name: "company-applications-add-contact-data",
    up: `
    alter table
      company_applications
    add
      contact_email varchar(511)
    ;

    alter table
      company_applications
    add
      contact_name varchar(511)
    ;

    alter table
      company_applications
    add
      contact_phone varchar(127)
    ;
    `,
    down: `
    alter table
      company_applications
    drop column
      "contact_email"
    ;

    alter table
      company_applications
    drop column
      "contact_name"
    ;

    alter table
      company_applications
    drop column
      "contact_phone"
    ;
    `,
  },
];
