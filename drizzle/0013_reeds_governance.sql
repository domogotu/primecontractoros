-- Reeds Technology governance foundation v1.
-- Dialect: MySQL 8.x (this repository currently uses drizzle-orm/mysql2).
-- Adds durable lifecycle contracts without replacing existing application tables.

CREATE TABLE IF NOT EXISTS reeds_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, event_id VARCHAR(80) NOT NULL UNIQUE,
  correlation_id VARCHAR(80) NOT NULL, causation_id VARCHAR(80) NULL,
  event_type VARCHAR(160) NOT NULL, schema_version VARCHAR(20) NOT NULL,
  occurred_at DATETIME(3) NOT NULL, received_at DATETIME(3) NOT NULL,
  owner_id BIGINT NULL, workspace_id BIGINT NULL, project_id VARCHAR(160) NULL,
  actor_type VARCHAR(80) NOT NULL, actor_id VARCHAR(160) NULL, authenticated BOOLEAN NOT NULL DEFAULT FALSE,
  source_system VARCHAR(160) NOT NULL, source_channel VARCHAR(160) NOT NULL, source_adapter VARCHAR(160) NOT NULL,
  sensitivity VARCHAR(40) NOT NULL, contains_pii BOOLEAN NOT NULL DEFAULT FALSE, contains_secret BOOLEAN NOT NULL DEFAULT FALSE,
  retention_class VARCHAR(100) NOT NULL, idempotency_key VARCHAR(255) NOT NULL, content_hash CHAR(64) NOT NULL,
  signature_verified BOOLEAN NOT NULL DEFAULT FALSE, requested_capability VARCHAR(160) NOT NULL,
  payload JSON NULL, attachments JSON NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_reeds_events_corr (correlation_id), INDEX idx_reeds_events_workspace (workspace_id),
  UNIQUE KEY uq_reeds_event_idempotency (source_system, idempotency_key)
);

CREATE TABLE IF NOT EXISTS reeds_runs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, run_id VARCHAR(80) NOT NULL UNIQUE,
  event_id VARCHAR(80) NOT NULL, correlation_id VARCHAR(80) NOT NULL,
  owner_id BIGINT NULL, workspace_id BIGINT NULL, project_id VARCHAR(160) NULL, actor_id VARCHAR(160) NULL,
  purpose VARCHAR(255) NOT NULL, budget_ref VARCHAR(160) NULL, state VARCHAR(40) NOT NULL,
  current_stage TINYINT NOT NULL DEFAULT 1, risk_level VARCHAR(20) NOT NULL DEFAULT 'medium', status_reason TEXT NULL,
  started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), completed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_reeds_runs_corr (correlation_id), INDEX idx_reeds_runs_state (state), INDEX idx_reeds_runs_workspace (workspace_id)
);

CREATE TABLE IF NOT EXISTS reeds_handoffs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, handoff_id VARCHAR(80) NOT NULL UNIQUE,
  run_id VARCHAR(80) NOT NULL, correlation_id VARCHAR(80) NOT NULL,
  from_agent VARCHAR(160) NOT NULL, to_agent VARCHAR(160) NOT NULL, project_id VARCHAR(160) NULL,
  business_area VARCHAR(160) NOT NULL, objective TEXT NOT NULL, risk_level VARCHAR(20) NOT NULL,
  payload JSON NOT NULL, status VARCHAR(40) NOT NULL DEFAULT 'created',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), resolved_at DATETIME(3) NULL,
  INDEX idx_reeds_handoffs_run (run_id), INDEX idx_reeds_handoffs_corr (correlation_id)
);

CREATE TABLE IF NOT EXISTS reeds_policy_versions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, policy_id VARCHAR(160) NOT NULL, version VARCHAR(40) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft', rule_set JSON NOT NULL, content_hash CHAR(64) NOT NULL,
  effective_at DATETIME(3) NULL, retired_at DATETIME(3) NULL, created_by BIGINT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE KEY uq_reeds_policy_version (policy_id, version)
);

CREATE TABLE IF NOT EXISTS reeds_policy_decisions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, decision_id VARCHAR(80) NOT NULL UNIQUE,
  run_id VARCHAR(80) NOT NULL, correlation_id VARCHAR(80) NOT NULL, policy_id VARCHAR(160) NOT NULL,
  policy_version VARCHAR(40) NOT NULL, action_id VARCHAR(80) NULL, decision VARCHAR(30) NOT NULL,
  reason TEXT NOT NULL, action_hash CHAR(64) NULL, risk_level VARCHAR(20) NOT NULL,
  evaluated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX idx_reeds_policy_run (run_id)
);

CREATE TABLE IF NOT EXISTS reeds_approval_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, approval_id VARCHAR(80) NOT NULL UNIQUE,
  run_id VARCHAR(80) NOT NULL, correlation_id VARCHAR(80) NOT NULL, action_id VARCHAR(80) NOT NULL,
  action_hash CHAR(64) NOT NULL, requested_by VARCHAR(160) NOT NULL, action_class VARCHAR(50) NOT NULL,
  description TEXT NOT NULL, parameters JSON NOT NULL, destination VARCHAR(500) NULL, credential_ref VARCHAR(255) NULL,
  expected_cost DECIMAL(12,2) NOT NULL DEFAULT 0, reversible BOOLEAN NOT NULL DEFAULT FALSE,
  verification_method TEXT NULL, rollback_method TEXT NULL, expires_at DATETIME(3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending', created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_reeds_approval_run (run_id), INDEX idx_reeds_approval_status (status)
);

CREATE TABLE IF NOT EXISTS reeds_approval_decisions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, approval_id VARCHAR(80) NOT NULL, decision VARCHAR(30) NOT NULL,
  approver_id BIGINT NULL, approved_action_hash CHAR(64) NOT NULL, reason TEXT NULL,
  decided_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX idx_reeds_approval_decisions_approval (approval_id)
);

CREATE TABLE IF NOT EXISTS reeds_tool_registry (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, tool_id VARCHAR(200) NOT NULL UNIQUE, version VARCHAR(40) NOT NULL,
  owner_scope VARCHAR(160) NOT NULL, allowed_agents JSON NOT NULL, allowed_operations JSON NOT NULL,
  credential_ref VARCHAR(255) NULL, data_policy JSON NOT NULL, recipient_policy JSON NULL,
  approval_policy VARCHAR(160) NOT NULL, rate_limit VARCHAR(80) NULL, timeout_seconds INT NOT NULL DEFAULT 30,
  verification_policy VARCHAR(200) NOT NULL, enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS reeds_tool_executions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, action_id VARCHAR(80) NOT NULL UNIQUE, run_id VARCHAR(80) NOT NULL,
  correlation_id VARCHAR(80) NOT NULL, tool_id VARCHAR(200) NOT NULL, operation VARCHAR(160) NOT NULL,
  actor_id VARCHAR(160) NULL, credential_ref VARCHAR(255) NULL, parameters_hash CHAR(64) NOT NULL,
  request_payload JSON NULL, provider_request_id VARCHAR(255) NULL, provider_receipt JSON NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'started', started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  finished_at DATETIME(3) NULL, error_code VARCHAR(100) NULL, error_summary TEXT NULL,
  INDEX idx_reeds_tool_run (run_id), INDEX idx_reeds_tool_corr (correlation_id)
);

CREATE TABLE IF NOT EXISTS reeds_verification_results (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, verification_id VARCHAR(80) NOT NULL UNIQUE, action_id VARCHAR(80) NOT NULL,
  run_id VARCHAR(80) NOT NULL, correlation_id VARCHAR(80) NOT NULL, method VARCHAR(160) NOT NULL,
  expected_state JSON NULL, observed_state JSON NULL, evidence_ids JSON NULL, result VARCHAR(30) NOT NULL,
  confidence DECIMAL(5,2) NOT NULL DEFAULT 0, verified_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_reeds_verify_run (run_id), INDEX idx_reeds_verify_action (action_id)
);

CREATE TABLE IF NOT EXISTS reeds_evidence_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, evidence_id VARCHAR(80) NOT NULL UNIQUE, run_id VARCHAR(80) NOT NULL,
  correlation_id VARCHAR(80) NOT NULL, source_type VARCHAR(100) NOT NULL, source_ref VARCHAR(500) NULL,
  content_hash CHAR(64) NULL, storage_ref VARCHAR(1000) NULL, captured_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  immutable BOOLEAN NOT NULL DEFAULT FALSE, metadata JSON NULL, INDEX idx_reeds_evidence_run (run_id)
);

CREATE TABLE IF NOT EXISTS reeds_audit_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, audit_id VARCHAR(80) NOT NULL UNIQUE, correlation_id VARCHAR(80) NOT NULL,
  run_id VARCHAR(80) NULL, event_id VARCHAR(80) NULL, action_id VARCHAR(80) NULL, approval_id VARCHAR(80) NULL,
  actor_id VARCHAR(160) NULL, actor_type VARCHAR(80) NULL, workspace_id BIGINT NULL, project_id VARCHAR(160) NULL,
  event_type VARCHAR(160) NOT NULL, risk_level VARCHAR(20) NULL, reason TEXT NULL, evidence JSON NULL, result JSON NULL,
  final_state VARCHAR(60) NULL, unresolved_items JSON NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_reeds_audit_corr (correlation_id), INDEX idx_reeds_audit_run (run_id), INDEX idx_reeds_audit_created (created_at)
);

CREATE TABLE IF NOT EXISTS reeds_idempotency_keys (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, scope_key VARCHAR(255) NOT NULL, idempotency_key VARCHAR(255) NOT NULL,
  request_hash CHAR(64) NOT NULL, event_id VARCHAR(80) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'accepted',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE KEY uq_reeds_idempotency (scope_key, idempotency_key)
);

CREATE TABLE IF NOT EXISTS reeds_change_proposals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, proposal_id VARCHAR(80) NOT NULL UNIQUE, correlation_id VARCHAR(80) NOT NULL,
  capability_gap TEXT NOT NULL, artifact_ref VARCHAR(1000) NULL, artifact_hash CHAR(64) NULL, test_result JSON NULL,
  security_review JSON NULL, independent_review JSON NULL, owner_approval_id VARCHAR(80) NULL,
  release_state VARCHAR(40) NOT NULL DEFAULT 'proposed', canary_state VARCHAR(40) NULL, rollback_ref VARCHAR(1000) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
