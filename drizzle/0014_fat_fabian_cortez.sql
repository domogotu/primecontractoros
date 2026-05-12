CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int,
	`userId` int,
	`actionType` varchar(100) NOT NULL,
	`targetType` varchar(100),
	`targetId` int,
	`oldValue` text,
	`newValue` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int,
	`category` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`message` text,
	`relatedType` varchar(100),
	`relatedId` int,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`isRead` boolean NOT NULL DEFAULT false,
	`dismissedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_errors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`errorType` varchar(100) NOT NULL,
	`route` varchar(500),
	`userId` int,
	`workspaceId` int,
	`message` text,
	`stackTrace` text,
	`status` enum('new','investigating','resolved','ignored') DEFAULT 'new',
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `system_errors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('workspace_owner','trusted_admin','standard_user','read_only') NOT NULL,
	`grantedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aiRuns` ADD `runType` varchar(100);--> statement-breakpoint
ALTER TABLE `aiRuns` ADD `inputTokens` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `aiRuns` ADD `outputTokens` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `aiRuns` ADD `errorMessage` text;--> statement-breakpoint
ALTER TABLE `aiRuns` ADD `completedAt` timestamp;