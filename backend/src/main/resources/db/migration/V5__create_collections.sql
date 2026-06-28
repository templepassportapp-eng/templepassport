CREATE TABLE collections (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    type        VARCHAR(100) NOT NULL,
    total_count INTEGER      NOT NULL
);

CREATE TABLE collection_temples (
    collection_id UUID NOT NULL REFERENCES collections(id),
    temple_id     UUID NOT NULL REFERENCES temples(id),
    PRIMARY KEY (collection_id, temple_id)
);
