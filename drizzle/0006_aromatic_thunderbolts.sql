ALTER TABLE `contacts` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `contracts` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `files` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `invoices` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `opportunities` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `proposals` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `tasks` ADD `deletedAt` timestamp;