CREATE TABLE `closeoutChecklistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`closeoutId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`completedBy` int,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `closeoutChecklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`templateName` varchar(100),
	`status` enum('queued','sent','failed','skipped') NOT NULL DEFAULT 'queued',
	`errorMessage` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`planId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`status` enum('active','past_due','canceled','trialing','incomplete') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
