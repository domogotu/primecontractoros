CREATE TABLE `customer_adoption` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`metric_key` varchar(64) NOT NULL,
	`metric_value` varchar(255),
	`last_checked` timestamp,
	`status` varchar(32) NOT NULL DEFAULT 'unknown',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_adoption_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`document_type` varchar(64) NOT NULL,
	`document_id` int,
	`version_number` int NOT NULL DEFAULT 1,
	`title` varchar(255),
	`content` text,
	`file_key` varchar(512),
	`changed_by` int,
	`change_note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_key` varchar(64) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`html_body` text NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `file_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`file_id` int NOT NULL,
	`target_type` varchar(64) NOT NULL,
	`target_id` int NOT NULL,
	`link_type` varchar(64) NOT NULL,
	`is_primary` boolean DEFAULT false,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flowdown_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`contract_id` int NOT NULL,
	`subcontractor_id` int,
	`clause_reference` varchar(255),
	`clause_text` text,
	`review_status` varchar(32) NOT NULL DEFAULT 'pending',
	`flowdown_required` boolean DEFAULT false,
	`notes` text,
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flowdown_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`document_type` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`generated_by` varchar(32) NOT NULL DEFAULT 'ai',
	`source_record_type` varchar(64),
	`source_record_id` int,
	`file_key` varchar(512),
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generated_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(64) NOT NULL DEFAULT 'standard_user',
	`invited_by` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`expires_at` timestamp,
	`accepted_at` timestamp,
	`cancelled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `migrations_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`migration_name` varchar(255) NOT NULL,
	`version` varchar(64) NOT NULL,
	`applied_at` timestamp NOT NULL DEFAULT (now()),
	`success` boolean NOT NULL DEFAULT true,
	`rollback_note` text,
	`execution_time_ms` int,
	CONSTRAINT `migrations_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`user_id` int NOT NULL,
	`current_step` int NOT NULL DEFAULT 1,
	`total_steps` int NOT NULL DEFAULT 8,
	`step_data` json,
	`completed_steps` json,
	`percent_complete` int NOT NULL DEFAULT 0,
	`status` varchar(32) NOT NULL DEFAULT 'in_progress',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plan_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plan_id` int NOT NULL,
	`feature_key` varchar(64) NOT NULL,
	`feature_value` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plan_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `record_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`target_type` varchar(64) NOT NULL,
	`target_id` int NOT NULL,
	`note_text` text NOT NULL,
	`author_id` int NOT NULL,
	`is_pinned` boolean NOT NULL DEFAULT false,
	`is_internal` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `record_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `record_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`target_type` varchar(64) NOT NULL,
	`target_id` int NOT NULL,
	`event_type` varchar(64) NOT NULL,
	`description` text,
	`old_value` text,
	`new_value` text,
	`user_id` int,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `record_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subcontractors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`company_name` varchar(255) NOT NULL,
	`point_of_contact` varchar(255),
	`email` varchar(255),
	`phone` varchar(64),
	`role` varchar(128),
	`linked_contract_id` int,
	`scope_of_work` text,
	`required_documents` json,
	`insurance_cert_evidence` json,
	`flowdown_clauses` json,
	`deliverables_assigned` json,
	`payment_status` varchar(64),
	`performance_notes` text,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`archived_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subcontractors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspace_id` int NOT NULL,
	`company_name` varchar(255) NOT NULL,
	`vendor_type` varchar(64) NOT NULL,
	`contact_name` varchar(255),
	`email` varchar(255),
	`phone` varchar(64),
	`address` text,
	`certifications` json,
	`documents` json,
	`notes` text,
	`linked_opportunity_ids` json,
	`linked_contract_ids` json,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`performance_history` json,
	`archived_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
