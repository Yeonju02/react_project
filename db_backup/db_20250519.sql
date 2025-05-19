-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.41 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- project 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `project` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `project`;

-- 테이블 project.tbl_comment 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_comment` (
  `comment_no` int NOT NULL AUTO_INCREMENT,
  `post_no` int DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `content` text,
  `parent_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_no`),
  KEY `post_no` (`post_no`),
  KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `tbl_comment_ibfk_1` FOREIGN KEY (`post_no`) REFERENCES `tbl_post` (`post_no`),
  CONSTRAINT `tbl_comment_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`),
  CONSTRAINT `tbl_comment_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `tbl_comment` (`comment_no`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_comment:~6 rows (대략적) 내보내기
INSERT INTO `tbl_comment` (`comment_no`, `post_no`, `user_id`, `content`, `parent_id`, `created_at`) VALUES
	(4, 4, 'admin', '댓글을 조오오오오오옹나 길게 작성하면 어떻게 되는거죵', NULL, '2025-05-09 12:40:47'),
	(11, 9, 'admin', '뭐야', NULL, '2025-05-15 12:13:08'),
	(12, 9, 'admin', '엥', 11, '2025-05-15 12:13:19'),
	(13, 4, 'admin', '@user1 fsdf', NULL, '2025-05-15 12:23:16'),
	(15, 4, 'admin', '@admin ㄴㅇㄹ', 13, '2025-05-15 15:55:18'),
	(16, 4, 'admin', 'ㄷㅇㅇㅇ', NULL, '2025-05-15 16:08:13');

-- 테이블 project.tbl_comment_like 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_comment_like` (
  `like_no` int NOT NULL AUTO_INCREMENT,
  `comment_no` int DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_no`),
  UNIQUE KEY `comment_no` (`comment_no`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tbl_comment_like_ibfk_1` FOREIGN KEY (`comment_no`) REFERENCES `tbl_comment` (`comment_no`),
  CONSTRAINT `tbl_comment_like_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_comment_like:~2 rows (대략적) 내보내기
INSERT INTO `tbl_comment_like` (`like_no`, `comment_no`, `user_id`, `created_at`) VALUES
	(23, 12, 'admin', '2025-05-15 12:13:26');

-- 테이블 project.tbl_dm_member 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_dm_member` (
  `room_no` int NOT NULL,
  `user_id` varchar(50) NOT NULL,
  PRIMARY KEY (`room_no`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tbl_dm_member_ibfk_1` FOREIGN KEY (`room_no`) REFERENCES `tbl_dm_room` (`room_no`),
  CONSTRAINT `tbl_dm_member_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_dm_member:~8 rows (대략적) 내보내기
INSERT INTO `tbl_dm_member` (`room_no`, `user_id`) VALUES
	(7, 'admin'),
	(9, 'admin'),
	(17, 'admin'),
	(7, 'user1'),
	(16, 'user1'),
	(10, 'user2'),
	(17, 'user2'),
	(9, 'user3'),
	(10, 'user3'),
	(16, 'user4');

-- 테이블 project.tbl_dm_msg 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_dm_msg` (
  `msg_no` int NOT NULL AUTO_INCREMENT,
  `room_no` int DEFAULT NULL,
  `sender_id` varchar(50) DEFAULT NULL,
  `content` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_read` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'N',
  PRIMARY KEY (`msg_no`),
  KEY `room_no` (`room_no`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `tbl_dm_msg_ibfk_1` FOREIGN KEY (`room_no`) REFERENCES `tbl_dm_room` (`room_no`),
  CONSTRAINT `tbl_dm_msg_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `tbl_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_dm_msg:~20 rows (대략적) 내보내기
INSERT INTO `tbl_dm_msg` (`msg_no`, `room_no`, `sender_id`, `content`, `created_at`, `is_read`) VALUES
	(12, 7, 'admin', '조연주가 보낸 메시지임 ㅎㅎ', '2025-05-12 16:49:05', NULL),
	(14, 9, 'user3', 'ㄴㅇㄹㄴ', '2025-05-14 11:57:10', NULL),
	(15, 9, 'admin', 'ㅇㄴㄹ', '2025-05-14 12:52:51', 'Y'),
	(16, 9, 'admin', 'ㄴㅇㄻ', '2025-05-14 12:52:53', 'Y'),
	(17, 9, 'admin', 'ㄹㄷㅈㄹ', '2025-05-14 12:52:54', 'Y'),
	(18, 9, 'user3', 'ㄴㅇㄹㄴ', '2025-05-14 13:01:33', 'Y'),
	(19, 9, 'user3', 'ㄴㅇㄹ', '2025-05-14 13:01:34', 'Y'),
	(20, 9, 'admin', 'admin이 보냄요', '2025-05-14 15:14:12', 'Y'),
	(21, 7, 'admin', '안녕하세요', '2025-05-14 15:14:19', 'Y'),
	(22, 7, 'admin', '2개 보냄', '2025-05-14 15:14:22', 'Y'),
	(23, 10, 'user2', 'ㅎㅇ ', '2025-05-14 15:15:31', 'Y'),
	(24, 10, 'user2', '유저2ㅇ미', '2025-05-14 15:15:33', 'Y'),
	(25, 10, 'user3', '읽어랏', '2025-05-14 15:37:07', 'Y'),
	(29, 9, 'admin', '[게시글 공유]\n@user2님의 게시글\n"나 누구임"\n<image:>\npostNo:8', '2025-05-14 17:51:33', 'Y'),
	(30, 9, 'user3', '[게시글 공유]\n@admin님의 게시글\n"쿠루미 짱귀욥"\n<image:/uploads/1746694428655-image0.png>\npostNo:6\n\n📩 너무 귀엽지 않니', '2025-05-14 18:05:35', 'Y'),
	(35, 7, 'admin', '[게시글 공유]\n@user2님의 게시글\n"나 누구임"\n<image:>\npostNo:8', '2025-05-15 11:30:03', 'Y'),
	(36, 7, 'admin', '이게', '2025-05-15 11:30:03', 'Y'),
	(43, 16, 'user4', '어이', '2025-05-15 14:40:52', 'Y'),
	(44, 16, 'user4', '[게시글 공유]\n@admin님의 게시글\n"#고양이 입니다용"\n<image:/uploads/1747281272257-image0.png>\npostNo:10', '2025-05-15 14:40:58', 'Y'),
	(45, 16, 'user4', 'ㄴㅇㄹㄴㄹㄴ', '2025-05-15 14:40:58', 'Y'),
	(46, 9, 'admin', '[게시글 공유]\n@admin님의 게시글\n"원영이 얼빡"\n<image:/uploads/1747277663460-image0.png>\npostNo:9', '2025-05-15 17:36:26', 'N'),
	(47, 9, 'admin', 'ㄻㄴㅊㄹㄴ', '2025-05-15 17:36:26', 'N'),
	(48, 17, 'user2', 'ㅁㅇㄹ', '2025-05-18 17:37:28', 'N'),
	(49, 17, 'user2', '[게시글 공유]\n@admin님의 게시글\n" #OOTD "\n<image:/uploads/1747554701644-image0.png>\npostNo:16', '2025-05-18 17:47:13', 'N'),
	(50, 17, 'user2', '이거바', '2025-05-18 17:47:13', 'N'),
	(51, 10, 'user2', '[게시글 공유]\n@admin님의 게시글\n" #OOTD "\n<image:/uploads/1747554701644-image0.png>\npostNo:16', '2025-05-18 17:47:13', 'N'),
	(52, 10, 'user2', '이거바', '2025-05-18 17:47:13', 'N');

-- 테이블 project.tbl_dm_room 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_dm_room` (
  `room_no` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_no`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_dm_room:~4 rows (대략적) 내보내기
INSERT INTO `tbl_dm_room` (`room_no`, `created_at`) VALUES
	(7, '2025-05-12 16:48:58'),
	(9, '2025-05-14 11:57:09'),
	(10, '2025-05-14 15:15:23'),
	(16, '2025-05-15 14:40:50'),
	(17, '2025-05-18 17:37:26');

-- 테이블 project.tbl_follow 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_follow` (
  `follower_id` varchar(50) NOT NULL,
  `followee_id` varchar(50) NOT NULL,
  `followed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`,`followee_id`),
  KEY `followee_id` (`followee_id`),
  CONSTRAINT `tbl_follow_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `tbl_user` (`user_id`),
  CONSTRAINT `tbl_follow_ibfk_2` FOREIGN KEY (`followee_id`) REFERENCES `tbl_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_follow:~5 rows (대략적) 내보내기
INSERT INTO `tbl_follow` (`follower_id`, `followee_id`, `followed_at`) VALUES
	('admin', 'user1', '2025-05-12 10:29:36'),
	('admin', 'user3', '2025-05-18 15:09:44'),
	('user1', 'admin', '2025-05-12 10:21:33'),
	('user1', 'user4', '2025-05-12 15:43:06'),
	('user2', 'admin', '2025-05-18 17:34:49'),
	('user2', 'user3', '2025-05-14 15:15:14');

-- 테이블 project.tbl_like 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_like` (
  `like_no` int NOT NULL AUTO_INCREMENT,
  `post_no` int DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_no`),
  UNIQUE KEY `post_no` (`post_no`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tbl_like_ibfk_1` FOREIGN KEY (`post_no`) REFERENCES `tbl_post` (`post_no`),
  CONSTRAINT `tbl_like_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_like:~3 rows (대략적) 내보내기
INSERT INTO `tbl_like` (`like_no`, `post_no`, `user_id`, `created_at`) VALUES
	(30, 7, 'user1', '2025-05-14 09:54:26'),
	(31, 4, 'user1', '2025-05-14 10:14:32'),
	(47, 4, 'admin', '2025-05-18 16:21:15'),
	(50, 7, 'admin', '2025-05-18 16:21:37');

-- 테이블 project.tbl_mention 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_mention` (
  `mention_no` int NOT NULL AUTO_INCREMENT,
  `post_no` int DEFAULT NULL,
  `mentioned_user_id` varchar(50) DEFAULT NULL,
  `mentioner_user_id` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mention_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_mention:~0 rows (대략적) 내보내기

-- 테이블 project.tbl_notification 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_notification` (
  `noti_no` int NOT NULL AUTO_INCREMENT,
  `receiver_id` varchar(50) DEFAULT NULL,
  `sender_id` varchar(50) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `content` text,
  `is_read` char(1) DEFAULT 'N',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `target_post` int DEFAULT NULL,
  `target_comment` int DEFAULT NULL,
  `target_user` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`noti_no`),
  KEY `receiver_id` (`receiver_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `tbl_notification_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `tbl_user` (`user_id`),
  CONSTRAINT `tbl_notification_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `tbl_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_notification:~6 rows (대략적) 내보내기
INSERT INTO `tbl_notification` (`noti_no`, `receiver_id`, `sender_id`, `type`, `content`, `is_read`, `created_at`, `target_post`, `target_comment`, `target_user`) VALUES
	(1, 'admin', 'user1', 'like', 'user1님이 회원님의 게시글을 좋아합니다.', 'Y', '2025-05-14 09:54:26', 7, NULL, NULL),
	(2, 'admin', 'user1', 'like', 'user1님이 회원님의 게시글을 좋아합니다.', 'Y', '2025-05-14 10:14:32', 4, NULL, NULL),
	(3, 'admin', 'user3', 'comment', 'user3님이 회원님의 게시글에 댓글을 남겼습니다.', 'Y', '2025-05-14 10:55:01', 6, NULL, NULL),
	(4, 'user3', 'admin', 'reply', 'admin님이 회원님의 댓글에 답글을 남겼습니다.', 'Y', '2025-05-14 11:45:10', 6, 9, NULL),
	(6, 'admin', 'user2', 'like', 'user2님이 회원님의 게시글을 좋아합니다.', 'Y', '2025-05-14 15:48:46', 7, NULL, NULL),
	(7, 'admin', 'user2', 'like', 'user2님이 회원님의 게시글을 좋아합니다.', 'Y', '2025-05-14 16:20:00', 4, NULL, NULL),
	(8, 'user2', 'admin', 'tag', 'admin님이 회원님을 게시글에 태그했습니다.', 'Y', '2025-05-18 16:51:41', 16, NULL, NULL);

-- 테이블 project.tbl_post 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_post` (
  `post_no` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `content` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_no`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tbl_post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_post:~8 rows (대략적) 내보내기
INSERT INTO `tbl_post` (`post_no`, `user_id`, `content`, `created_at`) VALUES
	(4, 'admin', 'ㅇㄹㅈㄴㅇㄹㄴ', '2025-05-08 14:19:35'),
	(5, 'admin', '사진 없는 게시물', '2025-05-08 17:45:28'),
	(7, 'admin', '몇글자까지 작성할 수 있나 테스트를 해보는 ㄴ거에요\r\n아너ㅣㅓ히ㅓ지 ㅓㅎㅈ덜ㅈ\r\n린ㅇ이너리날', '2025-05-08 17:57:18'),
	(8, 'user2', '나 누구임', '2025-05-14 16:46:55'),
	(9, 'admin', '원영이 얼빡', '2025-05-15 11:54:23'),
	(10, 'admin', '#고양이 입니다용', '2025-05-15 12:54:32'),
	(14, 'admin', 'user2 태그함!!!!', '2025-05-18 16:06:16'),
	(16, 'admin', ' #OOTD ', '2025-05-18 16:51:41');

-- 테이블 project.tbl_post_img 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_post_img` (
  `img_no` int NOT NULL AUTO_INCREMENT,
  `post_no` int DEFAULT NULL,
  `img_path` varchar(255) DEFAULT NULL,
  `thumbnail` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`img_no`),
  KEY `post_no` (`post_no`),
  CONSTRAINT `tbl_post_img_ibfk_1` FOREIGN KEY (`post_no`) REFERENCES `tbl_post` (`post_no`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_post_img:~8 rows (대략적) 내보내기
INSERT INTO `tbl_post_img` (`img_no`, `post_no`, `img_path`, `thumbnail`) VALUES
	(9, 4, '/uploads/1746681575890-image0.png', 'Y'),
	(10, 4, '/uploads/1746681575891-image1.png', NULL),
	(11, 4, '/uploads/1746681575891-image2.png', NULL),
	(12, 4, '/uploads/1746681575891-image3.png', NULL),
	(14, 9, '/uploads/1747277663460-image0.png', 'Y'),
	(15, 10, '/uploads/1747281272257-image0.png', 'Y'),
	(18, 14, '/uploads/1747551976585-image0.png', 'Y'),
	(19, 14, '/uploads/1747551976586-image1.png', 'N'),
	(21, 16, '/uploads/1747554701644-image0.png', 'Y');

-- 테이블 project.tbl_post_tag 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_post_tag` (
  `post_no` int NOT NULL,
  `tag_no` int NOT NULL,
  PRIMARY KEY (`post_no`,`tag_no`),
  KEY `tag_no` (`tag_no`),
  CONSTRAINT `tbl_post_tag_ibfk_1` FOREIGN KEY (`post_no`) REFERENCES `tbl_post` (`post_no`),
  CONSTRAINT `tbl_post_tag_ibfk_2` FOREIGN KEY (`tag_no`) REFERENCES `tbl_tag` (`tag_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_post_tag:~0 rows (대략적) 내보내기
INSERT INTO `tbl_post_tag` (`post_no`, `tag_no`) VALUES
	(16, 2);

-- 테이블 project.tbl_post_user_tag 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_post_user_tag` (
  `post_no` int DEFAULT NULL,
  `tagged_user_id` varchar(50) DEFAULT NULL,
  `position_x` float DEFAULT NULL,
  `position_y` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_post_user_tag:~1 rows (대략적) 내보내기
INSERT INTO `tbl_post_user_tag` (`post_no`, `tagged_user_id`, `position_x`, `position_y`) VALUES
	(14, 'user2', 0.605, 0.416211),
	(16, 'user2', 0.379958, 0.311211);

-- 테이블 project.tbl_saved_post 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_saved_post` (
  `user_id` varchar(50) NOT NULL,
  `post_no` int NOT NULL,
  `saved_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`post_no`),
  KEY `post_no` (`post_no`),
  CONSTRAINT `tbl_saved_post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_user` (`user_id`),
  CONSTRAINT `tbl_saved_post_ibfk_2` FOREIGN KEY (`post_no`) REFERENCES `tbl_post` (`post_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_saved_post:~1 rows (대략적) 내보내기
INSERT INTO `tbl_saved_post` (`user_id`, `post_no`, `saved_at`) VALUES
	('admin', 4, '2025-05-08 16:28:04');

-- 테이블 project.tbl_tag 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_tag` (
  `tag_no` int NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`tag_no`),
  UNIQUE KEY `tag_name` (`tag_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_tag:~0 rows (대략적) 내보내기
INSERT INTO `tbl_tag` (`tag_no`, `tag_name`) VALUES
	(2, 'OOTD'),
	(1, '고양이');

-- 테이블 project.tbl_user 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_user` (
  `user_id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  `bio` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.tbl_user:~4 rows (대략적) 내보내기
INSERT INTO `tbl_user` (`user_id`, `password`, `name`, `email`, `profile_img`, `bio`, `created_at`) VALUES
	('admin', '$2b$10$pTTiMDnVy4cT1tpPe3xQ5.6PtB.0LKHZdSIU7qOUoX6/cg7K9Ytqy', '조연주', 'cyj32148@naver.com', 'uploads/profile/profile_1747306392745.jpg', 'dasfdfsd\r\n', '2025-05-08 11:39:20'),
	('user1', '$2b$10$ZTL9rp1hgejh1R4okS7Plem2zLDICYYClGWAENNpKC4oYaqHtgmGq', '유저1', 'user1@naver.com', NULL, NULL, '2025-05-08 18:46:54'),
	('user2', '$2b$10$rrA4P47sHz2aq8GpE5Lti.xFJHdb9UMlI/OmOpXz..A2yoweIR1d.', '연주', 'user2@naver.com', 'uploads/profile/profile_1747302637446.jpg', '고양이 조아~', '2025-05-12 10:56:38'),
	('user3', '$2b$10$REvwI1f8wfxH8P3YZiqdZOSKLrEtHW32iTSq/nxKYkJ8xzV.fDRkO', '유저3', 'user3@naver.com', NULL, NULL, '2025-05-12 10:57:06'),
	('user4', '$2b$10$Lt2QDkB50/47xKFHD9Qrlu3rl/QWIQaK2DW3uzjKOwQirrn5rmfeq', '유저4', 'user4@naver.com', NULL, NULL, '2025-05-12 15:40:55');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
