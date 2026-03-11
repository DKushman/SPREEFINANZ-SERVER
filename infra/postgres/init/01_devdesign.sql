-- devdesign_db and schema (runs against default 'postgres' DB first)
CREATE DATABASE devdesign_db;
\c devdesign_db

CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(64),
    source VARCHAR(255),
    message TEXT,
    meta JSONB
);

CREATE TABLE lead_events (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(64) NOT NULL,
    payload JSONB
);

CREATE TABLE tracking_events (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(64) NOT NULL,
    session_id VARCHAR(255),
    page VARCHAR(512),
    payload JSONB
);
