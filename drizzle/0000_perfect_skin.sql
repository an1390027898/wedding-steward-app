CREATE TABLE `weddings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`groom` text NOT NULL,
	`bride` text NOT NULL,
	`wedding_date` text NOT NULL,
	`banquet_time` text DEFAULT '11:38' NOT NULL,
	`status` text DEFAULT '筹备中' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`hotel` text DEFAULT '' NOT NULL,
	`groom_address` text DEFAULT '' NOT NULL,
	`bride_address` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`customs` text DEFAULT '[]' NOT NULL,
	`schedule` text DEFAULT '[]' NOT NULL,
	`contacts` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
