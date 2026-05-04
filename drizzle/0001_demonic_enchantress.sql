CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`proposalId` int,
	`title` varchar(255) NOT NULL,
	`contractNumber` varchar(100),
	`agency` varchar(255),
	`value` decimal(12,2),
	`startDate` timestamp,
	`endDate` timestamp,
	`status` enum('setup','active','modification','closeout','closed','suspended') DEFAULT 'setup',
	`health` enum('healthy','at_risk','warning') DEFAULT 'healthy',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`agency` varchar(255),
	`solicitation` varchar(255),
	`naics` varchar(50),
	`dueDate` timestamp,
	`type` varchar(100),
	`sourceLink` text,
	`summary` text,
	`status` enum('new','in_review','pursue','hold','no_pursue','moved_to_proposal','archived') DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`opportunityId` int,
	`title` varchar(255) NOT NULL,
	`framework` varchar(100),
	`dueDate` timestamp,
	`status` enum('draft','in_progress','under_review','submitted','won','lost','withdrawn','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`)
);
