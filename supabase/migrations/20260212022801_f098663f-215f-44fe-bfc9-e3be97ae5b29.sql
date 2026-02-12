
-- Enable leaked password protection
-- Note: This requires auth config, not a migration. Using HaveIBeenPwned integration.
-- The actual fix is via auth configuration, but we can add a comment migration for tracking.
SELECT 1; -- Placeholder: leaked password protection is configured via auth settings
