CREATE TABLE `consent_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workspaceId` int,
	`consentType` varchar(100) NOT NULL DEFAULT 'terms_and_privacy',
	`policyVersion` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`ipAddress` varchar(100),
	`userAgent` varchar(500),
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consent_records_id` PRIMARY KEY(`id`)
);
