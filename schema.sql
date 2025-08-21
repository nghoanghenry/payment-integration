CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    stripe_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL
);