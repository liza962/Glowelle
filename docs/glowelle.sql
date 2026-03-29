-- MySQL dump 10.13  Distrib 8.0.28, for macos11 (x86_64)
--
-- Host: 127.0.0.1    Database: glowelle
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `package_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'Radiance Bundle','Liza Bajrami','lizabajrami962@gmail.com','+38349700700','Prishtine','pending','2026-03-26 13:41:23'),(2,'Radiance Bundle','Liza Bajrami','lizabajrami962@gmail.com','+38349700700','prishtine','confirmed','2026-03-26 13:45:08'),(3,'Complete Care','Liza Bajrami2','lizabajrami962@gmail.com','049500500','Prishtine','pending','2026-03-29 01:17:41');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `user_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`product_id`),
  KEY `fk_cart_product` (`product_id`),
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_settings`
--

DROP TABLE IF EXISTS `contact_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_settings` (
  `id` tinyint unsigned NOT NULL DEFAULT '1',
  `brand_title` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line2` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `map_embed_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_settings`
--

LOCK TABLES `contact_settings` WRITE;
/*!40000 ALTER TABLE `contact_settings` DISABLE KEYS */;
INSERT INTO `contact_settings` VALUES (1,'Glowelle','Visit us','Rruga Mother Teresa','Prishtina 10000','Kosovo','https://www.google.com/maps?q=42.6629,21.1655&hl=en&z=16&output=embed','2026-03-29 16:10:34');
/*!40000 ALTER TABLE `contact_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'Welcome to Glowelle news','We’re glad you’re here. This space is for short updates—new services, seasonal tips, and reminders that fit real routines.\n\nCheck back from time to time; we’ll keep posts practical and jargon-light.','2026-03-29 00:15:16','2026-03-29 00:15:16'),(2,'Sunscreen every day, even indoors','UVA passes through glass and contributes to aging year-round. A generous layer of broad-spectrum SPF in the morning is one of the highest-impact habits you can keep.\n\nIf your makeup or moisturizer includes SPF, that can count—just use enough product to cover your face and neck evenly.','2026-03-29 00:15:16','2026-03-29 00:15:16'),(3,'Patch test new products','Before applying a new serum or cream all over, try a small amount behind your ear or on your inner arm for a few days. It’s a simple way to catch irritation early.\n\nIntroduce one new product at a time so you know what your skin is reacting to.','2026-03-29 00:15:16','2026-03-29 00:15:16'),(4,'Hydration and barrier care','Healthy skin starts with a comfortable barrier. If your skin feels tight after cleansing, consider a gentler cleanser and a moisturizer that seals without feeling heavy.\n\nLayer humectants (like glycerin or hyaluronic acid) under an occlusive or cream when the air is dry.','2026-03-29 00:15:16','2026-03-29 00:15:16');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,2,1,'Micellar Water — Sensitive','€18'),(2,1,3,3,'Balancing Gel Cleanser','€24');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,3,'Liza Bajrami','lizabajrami962@gmail.com','049700700','Prishtina','completed','2026-03-28 23:01:07');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_category`
--

DROP TABLE IF EXISTS `product_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_category` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_category`
--

LOCK TABLES `product_category` WRITE;
/*!40000 ALTER TABLE `product_category` DISABLE KEYS */;
INSERT INTO `product_category` VALUES (1,'Cleansers'),(2,'Masks'),(3,'Moisturizers'),(4,'Serums'),(5,'Sun Care'),(7,'test category'),(6,'Toners');
/*!40000 ALTER TABLE `product_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Cloud Cream Cleanser','Soft foam that removes makeup without stripping moisture.','€22','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img1?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(2,1,'Micellar Water — Sensitive','No-rinse cleanse for reactive skin; fragrance-free.','€18','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img2?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(3,1,'Balancing Gel Cleanser','Light gel for combination skin; refines without dryness.','€24','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img3?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(4,3,'Barrier Repair Cream','Ceramide-rich cream for overnight recovery.','€38','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img1?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(5,3,'Hydra-Gel Moisturizer','Oil-free gel-cream for oily and humid climates.','€32','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img2?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(6,3,'Rich Night Balm','Buttery balm for very dry or mature skin.','€45','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img3?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(7,4,'Vitamin C Bright Serum','15% L-ascorbic for radiance and uneven tone.','€42','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img1?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(8,4,'Niacinamide 10% Serum','Minimizes pores and balances oil over time.','€28','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img2?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(9,4,'Hyaluronic Acid Drops','Multi-weight HA for plump, dewy skin.','€26','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img3?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(10,4,'Retinol Night Complex','Encapsulated retinol for fine lines; start slow.','€48','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img1?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(11,5,'Mineral SPF 50 Fluid','Sheer zinc oxide; no white cast on medium tones.','€34','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img2?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(12,5,'SPF 30 Glow Lotion','Daily UV + subtle pearlescence under makeup.','€30','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img3?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(13,2,'Clay Purifying Mask','Kaolin + charcoal for weekly deep cleanse.','€29','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img1?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(14,2,'Overnight Jelly Mask','Sleeping mask with panthenol; wake up supple.','€31','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img2?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(15,2,'Hydrating Sheet Mask (5 pack)','Soothing essence masks for travel or after peels.','€20','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img3?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:29:47'),(16,6,'Rose Water Toner','Alcohol-free mist to prep skin after cleansing.','€19','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img1?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(17,6,'BHA Clarifying Toner','2% salicylic for texture and clogged pores.','€27','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img2?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(18,6,'Essence First Treatment','Ferment essence to boost absorption of serums.','€36','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img3?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-26 14:21:44','2026-03-29 17:36:24'),(19,7,'Test name','used for face','34','https://cdn.media.amplience.net/i/deciem/Shop-by-step-img1?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3','2026-03-28 23:25:47','2026-03-28 23:25:47');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'lizabajrami962@gmail.com','$2b$10$emz/Vy83jbd7wNgdnBuEtOPkv9eoNeyrkvwvuBDfQJn9NOILljmN2','Liza Bajrami','user','2026-03-28 23:00:23'),(4,'admin@glowelle.com','$2b$10$iOE1tZ7fXtfJHi5/Q3gYouCQMYDC.gUXaPvIy1dsrgDEjP6Ch4/1W','Administrator','admin','2026-03-28 23:03:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-29 19:44:24
