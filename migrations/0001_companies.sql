CREATE TABLE companies (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    ats text NOT NULL CHECK (ats IN ('greenhouse', 'lever', 'ashby')),
    board text NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'blocked')),
    status_note text,
    country text CHECK (country ~ '^[A-Z]{2}$'),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (ats, board)
);
