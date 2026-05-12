CREATE TABLE `platform_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int,
	`userId` int,
	`activityType` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_health_flags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`flagType` varchar(100) NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'warning',
	`title` varchar(255) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`resolutionNote` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_health_flags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `lessonType` varchar(100) DEFAULT 'other';--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `impactLevel` enum('low','medium','high','critical') DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `whatHappened` text;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `whatWorked` text;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `whatDidNotWork` text;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `actionTaken` text;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `preventionSteps` text;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `linkedRecordType` varchar(64);--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `linkedRecordId` int;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `linkedRecordTitle` varchar(255);--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `lessonStatus` enum('draft','active','archived','applied') DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `visibility` enum('workspace','team','private') DEFAULT 'workspace';--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `appliedToTemplateId` int;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `createdTaskId` int;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `authorId` int;