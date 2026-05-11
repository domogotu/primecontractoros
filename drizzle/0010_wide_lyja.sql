ALTER TABLE `users` ADD `accountStatus` enum('active','disabled','suspended') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastActivityAt` timestamp;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `status` enum('active','suspended','deactivated') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `trialUsed` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `workspaces` ADD `lastActivityAt` timestamp;