CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`type` enum('info','warning','critical','success') DEFAULT 'info',
	`linkedRecordType` varchar(50),
	`linkedRecordId` int,
	`isRead` boolean DEFAULT false,
	`isDismissed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `capabilityStatements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`version` varchar(50),
	`content` text,
	`naicsCodes` text,
	`pastPerformance` text,
	`differentiators` text,
	`status` enum('draft','active','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `capabilityStatements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `closeoutRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`contractId` int NOT NULL,
	`status` enum('not_started','in_progress','pending_review','completed') DEFAULT 'not_started',
	`finalInvoiceSubmitted` boolean DEFAULT false,
	`deliverablesComplete` boolean DEFAULT false,
	`governmentPropertyReturned` boolean DEFAULT false,
	`finalReportSubmitted` boolean DEFAULT false,
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `closeoutRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`contractId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`regulation` varchar(255),
	`category` varchar(100),
	`status` enum('compliant','non_compliant','at_risk','pending_review','not_applicable') DEFAULT 'pending_review',
	`dueDate` timestamp,
	`lastReviewDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`organization` varchar(255),
	`title` varchar(255),
	`role` varchar(100),
	`linkedRecordType` varchar(50),
	`linkedRecordId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deadlines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueDate` timestamp NOT NULL,
	`linkedRecordType` varchar(50),
	`linkedRecordId` int,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('upcoming','due_soon','overdue','completed') DEFAULT 'upcoming',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deadlines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`contractId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueDate` timestamp,
	`status` enum('not_started','in_progress','submitted','accepted','rejected','overdue') DEFAULT 'not_started',
	`submittedAt` timestamp,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(100),
	`size` int,
	`linkedRecordType` varchar(50),
	`linkedRecordId` int,
	`category` varchar(100),
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`contractId` int,
	`invoiceNumber` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`status` enum('draft','submitted','approved','paid','rejected','overdue') DEFAULT 'draft',
	`issuedDate` timestamp,
	`dueDate` timestamp,
	`paidDate` timestamp,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessonsLearned` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`contractId` int,
	`proposalId` int,
	`title` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`impact` enum('positive','negative','neutral') DEFAULT 'neutral',
	`recommendation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessonsLearned_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lossReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`proposalId` int NOT NULL,
	`reviewDate` timestamp,
	`reasonLost` text,
	`competitorInfo` text,
	`lessonsLearned` text,
	`actionItems` text,
	`status` enum('pending','in_progress','completed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lossReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int,
	`linkedRecordType` varchar(50),
	`linkedRecordId` int,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`linkedRecordType` varchar(50),
	`linkedRecordId` int,
	`authorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `obligations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`contractId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`obligationType` varchar(100),
	`frequency` varchar(50),
	`dueDate` timestamp,
	`status` enum('active','completed','overdue','waived') DEFAULT 'active',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `obligations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`invoiceId` int,
	`contractId` int,
	`amount` decimal(12,2) NOT NULL,
	`paymentDate` timestamp,
	`method` varchar(100),
	`reference` varchar(255),
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assignedTo` int,
	`linkedRecordType` varchar(50),
	`linkedRecordId` int,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('todo','in_progress','blocked','done','cancelled') DEFAULT 'todo',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`content` text,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
