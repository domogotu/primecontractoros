CREATE TABLE `access_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`state` enum('signup_started','pending_setup','trial_active','limited_access','pending_payment','active_paid','past_due','suspended','canceled','archived') NOT NULL DEFAULT 'signup_started',
	`previousState` varchar(50),
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	`changedBy` int,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `access_states_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billing_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`oldState` varchar(50),
	`newState` varchar(50),
	`reason` text,
	`adminId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billing_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `business_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`legalName` varchar(255),
	`dba` varchar(255),
	`website` varchar(500),
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`entityType` varchar(100),
	`uei` varchar(50),
	`cage` varchar(20),
	`samStatus` enum('active','expired','pending','not_registered') DEFAULT 'not_registered',
	`samRenewalDate` timestamp,
	`naicsCodes` text,
	`certifications` text,
	`capabilities` text,
	`contractingModel` enum('prime','sub','both') DEFAULT 'prime',
	`usesSubcontractors` boolean DEFAULT false,
	`defaultContactName` varchar(255),
	`defaultContactEmail` varchar(320),
	`defaultContactPhone` varchar(50),
	`profileCompletenessScore` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `capability_statement_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`capabilityStatementId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`content` text,
	`targetAudience` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `capability_statement_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `closeout_blocking_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`closeoutId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`blockerType` varchar(100) NOT NULL,
	`description` text,
	`recordType` varchar(64),
	`recordId` int,
	`status` enum('open','resolved') DEFAULT 'open',
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `closeout_blocking_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`recordType` varchar(64) NOT NULL,
	`recordId` int NOT NULL,
	`role` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`sourceFileId` int,
	`sourceLocation` varchar(500),
	`status` enum('open','met','waived','in_progress') DEFAULT 'open',
	`aiFindingId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contract_requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discount_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discountId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`amountSaved` decimal(10,2),
	CONSTRAINT `discount_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `file_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`versionNumber` int NOT NULL DEFAULT 1,
	`fileKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`uploadedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finance_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordType` enum('invoice','payment') NOT NULL,
	`recordId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`content` text NOT NULL,
	`authorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `finance_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `followups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`dueDate` timestamp,
	`notes` text,
	`status` enum('pending','complete') DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `followups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_payment_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`paymentId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`amountApplied` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_payment_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`oldStatus` varchar(50),
	`newStatus` varchar(50) NOT NULL,
	`changedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposal_frameworks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`frameworkType` enum('standard','technical','subcontract','simple','blank') DEFAULT 'standard',
	`sections` text,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposal_frameworks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposal_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`status` enum('not_started','in_progress','complete','needs_review') DEFAULT 'not_started',
	`isAiDraft` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposal_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`senderType` enum('customer','admin') NOT NULL,
	`senderId` int,
	`content` text NOT NULL,
	`isInternalNote` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`content` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `template_versions_id` PRIMARY KEY(`id`)
);
