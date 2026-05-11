ALTER TABLE `lessonsLearned` ADD `severity` enum('low','medium','high','critical') DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `rootCause` text;--> statement-breakpoint
ALTER TABLE `lessonsLearned` ADD `tags` varchar(500);