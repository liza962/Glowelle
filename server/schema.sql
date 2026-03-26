-- Run this whole file in phpMyAdmin: SQL tab → paste → Go
-- (Or: Import → choose this file)

CREATE DATABASE IF NOT EXISTS glowelle
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE glowelle;

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  package_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
