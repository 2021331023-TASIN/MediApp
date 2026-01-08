-- # -- -----------------------------------------------------
-- # -- Database: meditack_db
-- # -- -----------------------------------------------------
-- # CREATE DATABASE IF NOT EXISTS meditack_db;
-- # USE meditack_db;
-- #
-- # -- -----------------------------------------------------
-- # -- 1. Users Table (Authentication and Profile)
-- # -- -----------------------------------------------------
-- # CREATE TABLE users (
-- #     user_id INT AUTO_INCREMENT PRIMARY KEY,
-- #     name VARCHAR(255) NOT NULL,
-- #     email VARCHAR(255) UNIQUE NOT NULL,
-- #     password_hash VARCHAR(255) NOT NULL, -- Stores bcrypt hash
-- #     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- # );
-- #
-- # -- -----------------------------------------------------
-- # -- 2. Medicines Table (Drug Information)
-- # -- -----------------------------------------------------
-- # CREATE TABLE medicines (
-- #     medicine_id INT AUTO_INCREMENT PRIMARY KEY,
-- #     name VARCHAR(255) NOT NULL UNIQUE,
-- #     generic_name VARCHAR(255),
-- #     side_effects TEXT,
-- #     description TEXT,
-- #     interaction_warnings TEXT NULL -- Added column from previous steps
-- # );
-- #
-- # -- -----------------------------------------------------
-- # -- 3. User_Prescriptions Table (Linking User to Medicine & Dosage)
-- # -- This table now holds ALL dosage details needed by the frontend form.
-- # -- -----------------------------------------------------
-- # CREATE TABLE user_prescriptions (
-- #     prescription_id INT AUTO_INCREMENT PRIMARY KEY,
-- #     user_id INT NOT NULL,
-- #     medicine_id INT NOT NULL,
-- #
-- #     -- Original column (kept for compatibility)
-- #     dosage VARCHAR(50) NOT NULL,
-- #
-- #     -- New columns added for the React frontend data structure:
-- #     pills_per_dose INTEGER NOT NULL DEFAULT 1,
-- #     doses_per_day INTEGER NOT NULL DEFAULT 1,
-- #     duration_days INTEGER NOT NULL DEFAULT 1,
-- #     instructions VARCHAR(500), -- Matches the frontend field
-- #
-- #     -- Tracking and Refill columns:
-- #     start_date DATE NOT NULL,
-- #     end_date DATE NULL,
-- #     is_active BOOLEAN DEFAULT TRUE,
-- #     initial_quantity INT NULL,
-- #     current_quantity INT NULL,
-- #     refill_alert_threshold INT DEFAULT 7,
-- #     refill_count INT DEFAULT 0,
-- #     instruction_notes TEXT NULL,
-- #
-- #     -- Foreign Key Definitions
-- #     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
-- #     FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
-- # );
-- #
-- #
-- # -- -----------------------------------------------------
-- # -- 4. Recurring_Schedules Table (Dose Times)
-- # -- This table stores the multiple daily times from the React form.
-- # -----------------------------------------------------
-- # CREATE TABLE recurring_schedules (
-- #     schedule_id INT AUTO_INCREMENT PRIMARY KEY,
-- #     prescription_id INT NOT NULL,
-- #     time_of_day TIME NOT NULL, -- The specific time (e.g., '08:00:00')
-- #     frequency_type ENUM('daily', 'weekly', 'specific') NOT NULL DEFAULT 'daily',
-- #     frequency_detail VARCHAR(50) NULL,
-- #
-- #     FOREIGN KEY (prescription_id) REFERENCES user_prescriptions(prescription_id) ON DELETE CASCADE
-- # );
-- #
-- # -- -----------------------------------------------------
-- # -- 5. Dose_History Table (Tracking and Regularity)
-- # -- -----------------------------------------------------
-- # CREATE TABLE dose_history (
-- #     dose_id BIGINT AUTO_INCREMENT PRIMARY KEY,
-- #     prescription_id INT NOT NULL,
-- #     scheduled_time DATETIME NOT NULL,
-- #     is_taken BOOLEAN DEFAULT FALSE,
-- #     taken_at DATETIME NULL,
-- #     notes TEXT,
-- #
-- #     FOREIGN KEY (prescription_id) REFERENCES user_prescriptions(prescription_id) ON DELETE CASCADE
-- # );
-- #
-- # -- -----------------------------------------------------
-- # -- 6. Doctors Table (Search and Contact)
-- # -- -----------------------------------------------------
-- # CREATE TABLE doctors (
-- #     doctor_id INT AUTO_INCREMENT PRIMARY KEY,
-- #     name VARCHAR(255) NOT NULL,
-- #     specialty VARCHAR(100),
-- #     contact_number VARCHAR(20),
-- #     clinic_address VARCHAR(255),
-- #     email VARCHAR(255)
-- # );
-- #
-- # -- -----------------------------------------------------
-- # -- Indexes for Performance
-- # -- -----------------------------------------------------
-- # CREATE INDEX idx_users_email ON users(email);
-- # CREATE INDEX idx_prescriptions_user_id ON user_prescriptions(user_id);
-- # CREATE INDEX idx_history_schedule ON dose_history(prescription_id, scheduled_time);
-- #


-- -----------------------------------------------------
-- Database: meditack_db
-- -----------------------------------------------------
CREATE DATABASE IF NOT EXISTS meditack_db;
USE meditack_db;
-- -----------------------------------------------------
-- 1. Users Table (Authentication and Profile)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- -----------------------------------------------------
-- 2. Medicines Table (Drug Information)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    generic_name VARCHAR(255),
    side_effects TEXT,
    description TEXT,
    interaction_warnings TEXT NULL
);
-- -----------------------------------------------------
-- 3. User_Prescriptions Table (Linking User to Medicine & Dosage)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user_prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    pills_per_dose INTEGER NOT NULL DEFAULT 1,
    doses_per_day INTEGER NOT NULL DEFAULT 1,
    duration_days INTEGER NOT NULL DEFAULT 1,
    instructions VARCHAR(500),
    start_date DATE NOT NULL,
    end_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    initial_quantity INT NULL,
    current_quantity INT NULL,
    refill_alert_threshold INT DEFAULT 7,
    refill_count INT DEFAULT 0,
    instruction_notes TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);
-- -----------------------------------------------------
-- 4. Recurring_Schedules Table (Dose Times)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS recurring_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    time_of_day TIME NOT NULL,
    frequency_type ENUM('daily', 'weekly', 'specific') NOT NULL DEFAULT 'daily',
    frequency_detail VARCHAR(50) NULL,
    FOREIGN KEY (prescription_id) REFERENCES user_prescriptions(prescription_id) ON DELETE CASCADE
);
-- -----------------------------------------------------
-- 5. Dose_History Table (Tracking and Regularity)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dose_history (
    dose_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    scheduled_time DATETIME NOT NULL,
    is_taken BOOLEAN DEFAULT FALSE,
    taken_at DATETIME NULL,
    notes TEXT,
    FOREIGN KEY (prescription_id) REFERENCES user_prescriptions(prescription_id) ON DELETE CASCADE
);
-- -----------------------------------------------------
-- 6. Doctors Table (Search and Contact)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    contact_number VARCHAR(20),
    clinic_address VARCHAR(255),
    email VARCHAR(255)
);
-- -----------------------------------------------------
-- 7. Vitals Table (Health Log) -- NEW
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'blood_pressure', 'weight', 'sugar'
    value VARCHAR(50) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- -----------------------------------------------------
-- Indexes for Performance
-- -----------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_prescriptions_user_id ON user_prescriptions(user_id);
CREATE INDEX idx_history_schedule ON dose_history(prescription_id, scheduled_time);
CREATE INDEX idx_vitals_user_id ON vitals(user_id);