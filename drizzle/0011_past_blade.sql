CREATE TABLE `legal_acceptances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workspaceId` int,
	`documentType` varchar(50) NOT NULL DEFAULT 'terms_of_service',
	`documentVersion` varchar(20) NOT NULL DEFAULT '1.0',
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `legal_acceptances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposal_team_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`memberName` varchar(255) NOT NULL,
	`role` varchar(100) NOT NULL,
	`sectionResponsibility` varchar(255),
	`status` enum('assigned','in_progress','review','complete') DEFAULT 'assigned',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposal_team_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `opportunities` ADD `setAside` varchar(100);