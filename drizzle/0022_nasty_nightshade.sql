CREATE TABLE `change_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`contractId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`changeType` varchar(64) NOT NULL DEFAULT 'scope',
	`status` varchar(64) NOT NULL DEFAULT 'draft',
	`impactCost` varchar(64),
	`impactSchedule` varchar(128),
	`submittedBy` varchar(255),
	`reviewedBy` varchar(255),
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `change_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deadlineReminders` boolean NOT NULL DEFAULT true,
	`invoiceAlerts` boolean NOT NULL DEFAULT true,
	`contractStatusChanges` boolean NOT NULL DEFAULT true,
	`proposalUpdates` boolean NOT NULL DEFAULT true,
	`weeklyDigest` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`responseStatus` int,
	`responseBody` text,
	`success` boolean NOT NULL DEFAULT false,
	`attemptCount` int NOT NULL DEFAULT 1,
	`nextRetryAt` timestamp,
	`deliveredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`url` varchar(2048) NOT NULL,
	`description` varchar(255),
	`secret` varchar(255),
	`events` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `deadlines` ADD `lastRemindedAt` timestamp;--> statement-breakpoint
ALTER TABLE `invoices` ADD `lastRemindedAt` timestamp;