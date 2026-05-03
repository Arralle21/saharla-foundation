-- ═══════════════════════════════════════════════
--  SAHARLA FOUNDATION — Database Setup
--  Run this ONCE in Hostinger phpMyAdmin:
--  hPanel → Databases → phpMyAdmin → SQL tab
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `events` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(255)     NOT NULL,
  `description` TEXT             NOT NULL,
  `date`        DATE             NOT NULL,
  `location`    VARCHAR(255)     DEFAULT '',
  `type`        ENUM('event','news','program') NOT NULL DEFAULT 'event',
  `category`    VARCHAR(100)     DEFAULT '',
  `photo`       VARCHAR(500)     DEFAULT '',
  `report_url`  VARCHAR(500)     DEFAULT '',
  `created_at`  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_date` (`date`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data (optional — delete after testing)
INSERT INTO `events` (`title`, `description`, `date`, `location`, `type`, `category`, `photo`, `report_url`) VALUES
('GBV Awareness Training Workshop',      'A 20-day workshop providing GBV awareness training to community leaders and health workers across Sool region.',                                                       '2024-03-15', 'Lasanod, Sool Region',  'event',   'Women Empowerment', '', ''),
('Teacher Training Program – Sanaag',    'Targeted training for teachers in conflict-affected schools to enhance instruction quality and support displaced students.',                                           '2024-04-08', 'Erigavo, Sanaag',       'program', 'Education',         '', ''),
('GBV Research Publication Released',    'Saharla Foundation releases findings from its comprehensive GBV Prevalence, Vulnerability, and Psychological Trauma Assessment.',                                     '2024-04-20', 'Mogadishu, Somalia',    'news',    'Research',          '', ''),
('Youth Vocational Training Graduation', 'Graduation ceremony for 60 youth participants who completed vocational training in carpentry, tailoring, and mobile phone repair.',                                   '2024-05-12', 'Cayn Region',           'event',   'Youth Development', '', ''),
('Community Tree-Planting Drive',        'Community-wide reforestation initiative with over 500 trees planted by youth volunteers and school children.',                                                        '2024-06-03', 'Sool & Sanaag',         'program', 'Climate Resilience', '', ''),
('Women Empowerment Research Phase 2',   'Saharla Foundation launches Phase 2 study: Empowering Women and Girls in Conflict-Affected Areas across SSC regions.',                                               '2024-06-22', 'SSC Regions',           'news',    'Research',          '', '');
