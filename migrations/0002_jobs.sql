CREATE TABLE jobs (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id bigint NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
    external_id text NOT NULL,
    title text NOT NULL,
    location text,
    url text NOT NULL,
    description text,
    note text,
    posted_at timestamptz,
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (company_id, external_id)
);
