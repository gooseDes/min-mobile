CREATE TABLE `chat_users` (
	`chat` integer NOT NULL,
	`user` integer NOT NULL,
	PRIMARY KEY(`chat`, `user`)
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text DEFAULT 'group' NOT NULL,
	`title` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text DEFAULT '',
	`sender` integer NOT NULL,
	`chat` integer NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text DEFAULT '' NOT NULL
);
