CREATE TABLE eligibility_checks (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id bigint NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
    source text NOT NULL CHECK (source IN ('llm', 'human')),
    eligible boolean NOT NULL,
    region text,
    evidence text,
    model text,
    prompt_version text,
    input_tokens integer,
    output_tokens integer,
    cost_micro_usd integer,
    latency_ms integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (source = 'human' OR (model IS NOT NULL AND prompt_version IS NOT NULL))
);

CREATE INDEX eligibility_checks_job_id_idx ON eligibility_checks (job_id);
