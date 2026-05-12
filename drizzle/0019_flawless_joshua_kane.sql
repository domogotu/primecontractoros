CREATE TABLE `backup_exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exportType` varchar(100) NOT NULL,
	`tableName` varchar(100),
	`workspaceId` int,
	`fileSize` int,
	`status` varchar(50) NOT NULL DEFAULT 'completed',
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backup_exports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plan_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`changeType` varchar(50) NOT NULL,
	`changedFields` text,
	`previousValues` text,
	`newValues` text,
	`changedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plan_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_task_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`status` varchar(50) NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`durationMs` int,
	`result` text,
	`errorMessage` text,
	`triggeredBy` varchar(50) DEFAULT 'scheduled',
	`triggeredByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_task_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`taskType` varchar(100) NOT NULL,
	`description` text,
	`schedule` varchar(100),
	`isEnabled` boolean NOT NULL DEFAULT true,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`lastDurationMs` int,
	`lastResult` varchar(50),
	`lastError` text,
	`retryCount` int DEFAULT 0,
	`relatedWorkspaceId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policy_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyType` varchar(100) NOT NULL,
	`version` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`publishedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `policy_versions_id` PRIMARY KEY(`id`)
);
