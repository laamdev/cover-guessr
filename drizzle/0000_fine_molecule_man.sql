-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `albums` (
	`id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`title` varchar(255) NOT NULL,
	`cover` text NOT NULL,
	`year` int NOT NULL,
	`artist_id` int NOT NULL,
	`genre_id` int NOT NULL);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` varchar(255) NOT NULL);
--> statement-breakpoint
CREATE TABLE `genres` (
	`id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` varchar(255) NOT NULL);
--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `albums` (`artist_id`);--> statement-breakpoint
CREATE INDEX `genre_id_idx` ON `albums` (`genre_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `name` ON `artists` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `name` ON `genres` (`name`);
*/