-- ============================================================
-- HAPMS — Healthcare Appointment & Prescription Management System
-- Milestone 4: DDL Scripts
-- Authors: Yahya Raees Khan | Eshal Khan | BSAI (B)
-- ============================================================

CREATE DATABASE IF NOT EXISTS hapms;
USE hapms;

-- ──────────────────────────────────────────────────────────────
-- TABLE: USER
-- Central authentication table for all system users.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE USER (
    user_id        INT            AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100)   NOT NULL,
    email          VARCHAR(150)   NOT NULL UNIQUE,
    password_hash  VARCHAR(255)   NOT NULL,
    role           ENUM('doctor','patient','admin') NOT NULL,
    phone          VARCHAR(20),
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_role  ON USER(role);
CREATE INDEX idx_user_email ON USER(email);

-- ──────────────────────────────────────────────────────────────
-- TABLE: DOCTOR
-- Doctor-specific attributes. Extends USER (role = 'doctor').
-- ──────────────────────────────────────────────────────────────
CREATE TABLE DOCTOR (
    doctor_id           INT           AUTO_INCREMENT PRIMARY KEY,
    user_id             INT           NOT NULL,
    specialization      VARCHAR(100)  NOT NULL,
    license_no          VARCHAR(50)   NOT NULL UNIQUE,
    availability_start  TIME,
    availability_end    TIME,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id)
        REFERENCES USER(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_doctor_user ON DOCTOR(user_id);
CREATE INDEX idx_doctor_spec ON DOCTOR(specialization);

-- ──────────────────────────────────────────────────────────────
-- TABLE: PATIENT
-- Patient-specific attributes. Extends USER (role = 'patient').
-- ──────────────────────────────────────────────────────────────
CREATE TABLE PATIENT (
    patient_id      INT          AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          NOT NULL,
    dob             DATE,
    blood_group     ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
    medical_history TEXT,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id)
        REFERENCES USER(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_patient_user ON PATIENT(user_id);

-- ──────────────────────────────────────────────────────────────
-- TABLE: MEDICINE
-- Catalogue of medicines referenced by prescriptions.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE MEDICINE (
    medicine_id   INT           AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL UNIQUE,
    type          VARCHAR(80),
    manufacturer  VARCHAR(150),
    description   TEXT
);

CREATE INDEX idx_medicine_type ON MEDICINE(type);

-- ──────────────────────────────────────────────────────────────
-- TABLE: APPOINTMENT
-- Every booking between a patient and a doctor.
-- UNIQUE(doctor_id, scheduled_at) prevents double-booking.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE APPOINTMENT (
    appointment_id  INT          AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT          NOT NULL,
    doctor_id       INT          NOT NULL,
    scheduled_at    DATETIME     NOT NULL,
    status          ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
    notes           TEXT,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id)
        REFERENCES PATIENT(patient_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)
        REFERENCES DOCTOR(doctor_id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_doctor_slot  UNIQUE (doctor_id, scheduled_at)
);

CREATE INDEX idx_appt_patient ON APPOINTMENT(patient_id);
CREATE INDEX idx_appt_doctor  ON APPOINTMENT(doctor_id);
CREATE INDEX idx_appt_status  ON APPOINTMENT(status);
CREATE INDEX idx_appt_date    ON APPOINTMENT(scheduled_at);

-- ──────────────────────────────────────────────────────────────
-- TABLE: PRESCRIPTION
-- Issued by a doctor at the end of an appointment.
-- One prescription per appointment (UNIQUE on appointment_id).
-- ──────────────────────────────────────────────────────────────
CREATE TABLE PRESCRIPTION (
    prescription_id  INT           AUTO_INCREMENT PRIMARY KEY,
    appointment_id   INT           NOT NULL UNIQUE,
    doctor_id        INT           NOT NULL,
    patient_id       INT           NOT NULL,
    medicine_id      INT           NOT NULL,
    dosage           VARCHAR(80)   NOT NULL,
    frequency        VARCHAR(80)   NOT NULL,
    duration_days    INT           NOT NULL,
    issued_date      DATE          NOT NULL DEFAULT (CURRENT_DATE),
    diagnosis        TEXT,
    CONSTRAINT fk_rx_appointment FOREIGN KEY (appointment_id)
        REFERENCES APPOINTMENT(appointment_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rx_doctor      FOREIGN KEY (doctor_id)
        REFERENCES DOCTOR(doctor_id)           ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rx_patient     FOREIGN KEY (patient_id)
        REFERENCES PATIENT(patient_id)         ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rx_medicine    FOREIGN KEY (medicine_id)
        REFERENCES MEDICINE(medicine_id)       ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_duration      CHECK (duration_days > 0)
);

CREATE INDEX idx_rx_patient     ON PRESCRIPTION(patient_id);
CREATE INDEX idx_rx_doctor      ON PRESCRIPTION(doctor_id);
CREATE INDEX idx_rx_medicine    ON PRESCRIPTION(medicine_id);
CREATE INDEX idx_rx_issued_date ON PRESCRIPTION(issued_date);
