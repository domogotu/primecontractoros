CREATE TABLE `loginEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`workspaceId` int,
	`email` varchar(320),
	`eventType` enum('login_success','login_failure','logout','token_refresh','password_reset') NOT NULL,
	`success` boolean NOT NULL DEFAULT true,
	`ipAddress` varchar(45),
	`userAgent` text,
	`deviceInfo` varchar(255),
	`failureReason` varchar(255),
	`suspiciousFlag` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loginEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(100) NOT NULL,
	`targetType` enum('workspace','user','plan','billing') NOT NULL,
	`targetId` int NOT NULL,
	`performedBy` int NOT NULL,
	`reason` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platformAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int,
	`userId` int,
	`note` text NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platformNotes_id` PRIMARY KEY(`id`)
);
