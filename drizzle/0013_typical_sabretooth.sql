CREATE TABLE `ai_extracted_obligations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`findingId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`obligationType` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`dueDate` timestamp,
	`recurrence` varchar(100),
	`evidenceNeeded` text,
	`suggestedOwner` varchar(255),
	`approvalState` enum('pending','approved','rejected','edited') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdRecordType` varchar(100),
	`createdRecordId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_extracted_obligations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_prompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promptKey` varchar(100) NOT NULL,
	`promptName` varchar(255) NOT NULL,
	`systemInstruction` text NOT NULL,
	`userTemplate` text NOT NULL,
	`outputSchema` text,
	`active` boolean NOT NULL DEFAULT true,
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_prompts_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_prompts_promptKey_unique` UNIQUE(`promptKey`)
);
--> statement-breakpoint
CREATE TABLE `ai_usage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`aiRunId` int,
	`featureUsed` varchar(100) NOT NULL,
	`modelUsed` varchar(100) NOT NULL,
	`inputTokens` int NOT NULL DEFAULT 0,
	`outputTokens` int NOT NULL DEFAULT 0,
	`estimatedCost` decimal(10,6) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_usage_logs_id` PRIMARY KEY(`id`)
);
