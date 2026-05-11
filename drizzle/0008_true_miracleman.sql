CREATE TABLE `guidanceEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`guidanceCategory` varchar(100),
	`actionId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guidanceEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guidancePreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`mode` enum('detailed','balanced','light') NOT NULL DEFAULT 'balanced',
	`enabledCategories` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guidancePreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suggestedNextActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`actionType` varchar(100) NOT NULL,
	`targetEntity` varchar(100),
	`targetEntityId` int,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`reason` text,
	`estimatedMinutes` int,
	`dismissedAt` timestamp,
	`completedAt` timestamp,
	`convertedToTaskId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `suggestedNextActions_id` PRIMARY KEY(`id`)
);
