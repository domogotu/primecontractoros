CREATE TABLE `aiFindingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`findingId` int NOT NULL,
	`oldState` varchar(50),
	`newState` varchar(50),
	`oldText` text,
	`newText` text,
	`changedBy` int NOT NULL,
	`reason` text,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiFindingHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiFindings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`aiRunId` int NOT NULL,
	`contractId` int,
	`fileId` int,
	`findingType` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`sourceLocation` varchar(500),
	`sourceExcerpt` text,
	`practicalMeaning` text,
	`confidence` int DEFAULT 75,
	`reviewState` enum('unreviewed','acknowledged','approved','rejected','stale') DEFAULT 'unreviewed',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`approvedLiveObjectType` varchar(50),
	`approvedLiveObjectId` int,
	`staleStatus` enum('current','stale','superseded') DEFAULT 'current',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiFindings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`relatedRecordType` varchar(50) NOT NULL,
	`relatedRecordId` int,
	`aiType` enum('guidance','analysis','findings') NOT NULL,
	`purpose` varchar(255),
	`modelUsed` varchar(100) DEFAULT 'gpt-4-mini',
	`inputSummary` text,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiSuggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`aiRunId` int NOT NULL,
	`relatedRecordType` varchar(50) NOT NULL,
	`relatedRecordId` int,
	`suggestionTitle` varchar(255) NOT NULL,
	`suggestionText` text NOT NULL,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`suggestedAction` text,
	`status` enum('new','acknowledged','accepted','dismissed','completed') DEFAULT 'new',
	`createdTaskId` int,
	`dismissedAt` timestamp,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiSuggestions_id` PRIMARY KEY(`id`)
);
