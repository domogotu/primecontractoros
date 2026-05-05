CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('create','update','delete','archive','restore') NOT NULL,
	`entity` varchar(100) NOT NULL,
	`entityId` int NOT NULL,
	`changes` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceMatrix` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`requirement` text NOT NULL,
	`section` varchar(100),
	`responseLocation` varchar(255),
	`assignedTo` varchar(255),
	`status` enum('not_started','in_progress','complete','non_compliant') DEFAULT 'not_started',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceMatrix_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractClins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`clinNumber` varchar(50) NOT NULL,
	`description` text,
	`quantity` int,
	`unitPrice` decimal(12,2),
	`totalValue` decimal(12,2),
	`status` enum('active','completed','cancelled') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractClins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractModifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`modNumber` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`modType` enum('administrative','funding','scope','period_of_performance','other') DEFAULT 'administrative',
	`valueChange` decimal(12,2),
	`effectiveDate` timestamp,
	`status` enum('draft','submitted','approved','rejected') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractModifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keyPersonnel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`clearanceLevel` varchar(100),
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `keyPersonnel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaceMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','member','viewer') NOT NULL DEFAULT 'member',
	`invitedBy` int,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaceMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaceSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaceSettings_id` PRIMARY KEY(`id`)
);
