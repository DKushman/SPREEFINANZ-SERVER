-- preiseberechnen_db and schema
CREATE DATABASE preiseberechnen_db;
\c preiseberechnen_db

CREATE TABLE calculators (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    config JSONB,
    inputs_schema JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_submissions (
    id SERIAL PRIMARY KEY,
    calculator_id INTEGER REFERENCES calculators(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contact JSONB,
    inputs JSONB,
    results JSONB,
    utm JSONB,
    referrer TEXT
);

CREATE TABLE tracking_events (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(64) NOT NULL,
    session_id VARCHAR(255),
    page VARCHAR(512),
    payload JSONB
);

CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_notes (
    id SERIAL PRIMARY KEY,
    lead_submission_id INTEGER NOT NULL REFERENCES lead_submissions(id) ON DELETE CASCADE,
    admin_user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note TEXT NOT NULL
);
