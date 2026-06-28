CREATE TABLE achievements (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(100) UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name   VARCHAR(100)
);

CREATE TABLE user_achievements (
    id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID      NOT NULL REFERENCES users(id),
    achievement_id UUID      NOT NULL REFERENCES achievements(id),
    earned_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);
