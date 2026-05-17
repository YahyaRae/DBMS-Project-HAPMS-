-- ============================================================
-- HAPMS — Healthcare Appointment & Prescription Management System
-- Milestone 5: DML Scripts — Load, Modify & Validate
-- Authors: Yahya Raees Khan | Eshal Khan | BSAI (B)
-- ============================================================

USE hapms;

-- ──────────────────────────────────────────────────────────────
-- SECTION 1: LOAD DATA
-- Update the file paths below to match your local CSV directory.
-- ──────────────────────────────────────────────────────────────

-- 1.1 MEDICINE (no foreign key dependencies — load first)
LOAD DATA INFILE '/path/to/csv/medicine.csv'
INTO TABLE MEDICINE
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(medicine_id, name, type, manufacturer, description);

-- 1.2 USER
LOAD DATA INFILE '/path/to/csv/user.csv'
INTO TABLE USER
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(user_id, name, email, password_hash, role, phone, created_at);

-- 1.3 DOCTOR (depends on USER)
LOAD DATA INFILE '/path/to/csv/doctor.csv'
INTO TABLE DOCTOR
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(doctor_id, user_id, specialization, license_no, availability_start, availability_end);

-- 1.4 PATIENT (depends on USER)
LOAD DATA INFILE '/path/to/csv/patient.csv'
INTO TABLE PATIENT
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(patient_id, user_id, dob, blood_group, medical_history);

-- 1.5 APPOINTMENT (depends on DOCTOR, PATIENT)
LOAD DATA INFILE '/path/to/csv/appointment.csv'
INTO TABLE APPOINTMENT
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(appointment_id, patient_id, doctor_id, scheduled_at, status, notes);

-- 1.6 PRESCRIPTION (depends on APPOINTMENT, DOCTOR, PATIENT, MEDICINE)
LOAD DATA INFILE '/path/to/csv/prescription.csv'
INTO TABLE PRESCRIPTION
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(prescription_id, appointment_id, doctor_id, patient_id,
 medicine_id, dosage, frequency, duration_days, issued_date, diagnosis);


-- ──────────────────────────────────────────────────────────────
-- SECTION 2: UPDATE OPERATIONS
-- ──────────────────────────────────────────────────────────────

-- 2.1 Update appointment status from 'confirmed' to 'completed'
--     for all appointments scheduled before today
UPDATE APPOINTMENT
SET    status = 'completed'
WHERE  status = 'confirmed'
  AND  scheduled_at < NOW();

-- 2.2 Update a patient's contact phone number
UPDATE USER
SET    phone = '+92-300-1234567'
WHERE  user_id = 5
  AND  role = 'patient';

-- 2.3 Update doctor availability hours
UPDATE DOCTOR
SET    availability_start = '09:00:00',
       availability_end   = '18:00:00'
WHERE  doctor_id = 3;


-- ──────────────────────────────────────────────────────────────
-- SECTION 3: DELETE OPERATIONS
-- ──────────────────────────────────────────────────────────────

-- 3.1 Cancel and remove appointments with 'cancelled' status
--     older than 6 months (no prescriptions exist for these)
DELETE FROM APPOINTMENT
WHERE  status = 'cancelled'
  AND  scheduled_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- 3.2 Remove a specific pending appointment (e.g. test booking)
DELETE FROM APPOINTMENT
WHERE  appointment_id = 120
  AND  status = 'pending';


-- ──────────────────────────────────────────────────────────────
-- SECTION 4: VALIDATION QUERIES
-- Run these after loading. Expected outputs are noted inline.
-- ──────────────────────────────────────────────────────────────

-- 4.1 Row count per table
SELECT 'USER'         AS table_name, COUNT(*) AS row_count FROM USER
UNION ALL
SELECT 'DOCTOR',       COUNT(*) FROM DOCTOR
UNION ALL
SELECT 'PATIENT',      COUNT(*) FROM PATIENT
UNION ALL
SELECT 'MEDICINE',     COUNT(*) FROM MEDICINE
UNION ALL
SELECT 'APPOINTMENT',  COUNT(*) FROM APPOINTMENT
UNION ALL
SELECT 'PRESCRIPTION', COUNT(*) FROM PRESCRIPTION;
-- Expected: USER=110, DOCTOR=50, PATIENT=55, MEDICINE=60,
--           APPOINTMENT=120, PRESCRIPTION=74

-- 4.2 NULL check on critical columns
SELECT 'USER - null email'       AS check_name, COUNT(*) AS null_count FROM USER        WHERE email          IS NULL
UNION ALL
SELECT 'USER - null role',        COUNT(*) FROM USER        WHERE role           IS NULL
UNION ALL
SELECT 'DOCTOR - null user_id',   COUNT(*) FROM DOCTOR      WHERE user_id        IS NULL
UNION ALL
SELECT 'PATIENT - null user_id',  COUNT(*) FROM PATIENT     WHERE user_id        IS NULL
UNION ALL
SELECT 'APPT - null doctor_id',   COUNT(*) FROM APPOINTMENT WHERE doctor_id      IS NULL
UNION ALL
SELECT 'APPT - null patient_id',  COUNT(*) FROM APPOINTMENT WHERE patient_id     IS NULL
UNION ALL
SELECT 'RX - null medicine_id',   COUNT(*) FROM PRESCRIPTION WHERE medicine_id   IS NULL
UNION ALL
SELECT 'RX - null dosage',        COUNT(*) FROM PRESCRIPTION WHERE dosage        IS NULL;
-- Expected: all null_count = 0

-- 4.3 Foreign key integrity — verify every prescription links to a valid appointment
SELECT COUNT(*) AS orphaned_prescriptions
FROM   PRESCRIPTION p
LEFT JOIN APPOINTMENT a ON p.appointment_id = a.appointment_id
WHERE  a.appointment_id IS NULL;
-- Expected: 0

-- 4.4 Double-booking check — confirm no two appointments share doctor + timeslot
SELECT   doctor_id, scheduled_at, COUNT(*) AS duplicates
FROM     APPOINTMENT
GROUP BY doctor_id, scheduled_at
HAVING   COUNT(*) > 1;
-- Expected: 0 rows returned

-- 4.5 Sample JOIN — patient name with their doctor and prescription details
SELECT
    pu.name                AS patient_name,
    du.name                AS doctor_name,
    d.specialization,
    a.scheduled_at,
    m.name                 AS medicine,
    CONCAT(p.dosage, ' ', p.frequency, ' for ', p.duration_days, ' days') AS prescription_detail,
    p.diagnosis
FROM       PRESCRIPTION p
JOIN       APPOINTMENT  a  ON p.appointment_id = a.appointment_id
JOIN       PATIENT      pt ON p.patient_id     = pt.patient_id
JOIN       USER         pu ON pt.user_id        = pu.user_id
JOIN       DOCTOR       d  ON p.doctor_id       = d.doctor_id
JOIN       USER         du ON d.user_id         = du.user_id
JOIN       MEDICINE     m  ON p.medicine_id     = m.medicine_id
ORDER BY   a.scheduled_at DESC
LIMIT 10;

-- 4.6 Weekly report — number of completed appointments per doctor
SELECT
    du.name            AS doctor_name,
    d.specialization,
    COUNT(a.appointment_id) AS patients_seen
FROM       DOCTOR      d
JOIN       USER        du ON d.user_id    = du.user_id
JOIN       APPOINTMENT a  ON a.doctor_id  = d.doctor_id
WHERE      a.status = 'completed'
  AND      a.scheduled_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY   d.doctor_id, du.name, d.specialization
ORDER BY   patients_seen DESC;
