CREATE TABLE `admin_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('open','completed','cancelled') NOT NULL DEFAULT 'open',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdBy` int NOT NULL,
	`assignedTo` int,
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_tasks_id` PRIMARY KEY(`id`)
);
