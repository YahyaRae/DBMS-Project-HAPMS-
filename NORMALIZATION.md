# HAPMS — Normalization Document (Milestone 2)

**Project:** Healthcare Appointment & Prescription Management System  
**Authors:** Yahya Raees Khan | Eshal Khan | BSAI (B)

---

## Overview

This document walks through the normalization of the HAPMS schema from 1NF through 3NF. For each table and each normal form, we state whether a change was needed, what the issue was (if any), what was done, and why.

---

## First Normal Form (1NF)

**Rule:** Every column must hold atomic (indivisible) values. No repeating groups. Every row must be uniquely identifiable.

### USER
- **Status:** Satisfies 1NF — no changes needed.
- **Justification:** All columns (name, email, password_hash, role, phone) hold single atomic values. The role column uses an ENUM which constrains it to exactly one value. The primary key `user_id` uniquely identifies each row.

### DOCTOR
- **Status:** Satisfies 1NF — no changes needed.
- **Justification:** All attributes are atomic. `availability_start` and `availability_end` are stored as separate TIME columns rather than a combined range string, which would have been a 1NF violation.

### PATIENT
- **Status:** Required a change.
- **Issue:** An early draft stored `medical_history` as a comma-separated list of conditions in one field (e.g. `"Hypertension, Diabetes, Asthma"`). This is a non-atomic, multi-valued attribute and violates 1NF.
- **Change:** `medical_history` was changed to a TEXT field that stores a free-text summary written by the doctor rather than a structured list. For the scope of this project (no query-by-condition requirement), this satisfies 1NF. A full production system would decompose this into a separate `PATIENT_CONDITION` table.
- **Why:** A comma-separated string cannot be reliably queried, sorted, or validated at the database level.

### MEDICINE
- **Status:** Satisfies 1NF — no changes needed.
- **Justification:** Each column holds one atomic value. `name`, `type`, `manufacturer`, and `description` are all single-valued. Primary key `medicine_id` guarantees row uniqueness.

### APPOINTMENT
- **Status:** Satisfies 1NF — no changes needed.
- **Justification:** `scheduled_at` is a single DATETIME value. `status` is a single ENUM value. No repeating groups exist. `appointment_id` is the primary key.

### PRESCRIPTION
- **Status:** Required a change.
- **Issue:** An early draft stored dosage instructions as a single combined string (e.g. `"500mg twice daily for 7 days"`). This bundles three separate facts into one column.
- **Change:** Split into three atomic columns: `dosage` (e.g. `500mg`), `frequency` (e.g. `Twice daily`), `duration_days` (e.g. `7`).
- **Why:** Splitting allows individual attributes to be queried, validated (e.g. CHECK on duration_days > 0), and updated independently.

---

## Second Normal Form (2NF)

**Rule:** Must be in 1NF. Every non-key attribute must be fully functionally dependent on the *entire* primary key — not just part of it. (Only relevant for tables with composite primary keys.)

### USER, DOCTOR, PATIENT, MEDICINE, APPOINTMENT, PRESCRIPTION
- **Status:** All tables satisfy 2NF — no changes needed.
- **Justification:** Every table uses a single-column surrogate primary key (`user_id`, `doctor_id`, etc.). There are no composite primary keys in the schema, so partial dependency — the only violation of 2NF — cannot occur. Every non-key attribute depends entirely on its table's primary key.

  Examples:
  - In DOCTOR: `specialization`, `license_no`, `availability_start`, `availability_end` all describe the doctor identified by `doctor_id`. No partial dependency is possible.
  - In PRESCRIPTION: `dosage`, `frequency`, `duration_days`, `diagnosis` all describe the specific prescription identified by `prescription_id`.

---

## Third Normal Form (3NF)

**Rule:** Must be in 2NF. No non-key attribute may be transitively dependent on the primary key through another non-key attribute.

### USER
- **Status:** Satisfies 3NF — no changes needed.
- **Justification:** No transitive dependencies exist. `email`, `name`, `phone`, and `role` are all direct facts about `user_id`. None of them determines any other non-key attribute.

### DOCTOR
- **Status:** Required a change.
- **Issue:** An early draft included a `clinic_address` column directly in DOCTOR. Since multiple doctors can share the same clinic, `clinic_address` would be functionally dependent on the clinic, not on `doctor_id` — a transitive dependency.
- **Change:** `clinic_address` was removed from DOCTOR. For the current project scope, clinic location is not a required attribute. If needed in future, it would be extracted into a separate `CLINIC` table.
- **Why:** Keeping it in DOCTOR would cause update anomalies — changing a clinic address would require updating every doctor record associated with it.

### PATIENT
- **Status:** Satisfies 3NF — no changes needed.
- **Justification:** `dob`, `blood_group`, and `medical_history` all directly describe the patient. `blood_group` does not determine any other attribute in the table. No transitive chain exists.

### MEDICINE
- **Status:** Satisfies 3NF — no changes needed.
- **Justification:** `type`, `manufacturer`, and `description` all directly describe the medicine identified by `medicine_id`. `manufacturer` does not determine `type` or vice versa within this table.

### APPOINTMENT
- **Status:** Satisfies 3NF — no changes needed.
- **Justification:** `scheduled_at`, `status`, and `notes` all directly describe the appointment. `patient_id` and `doctor_id` are foreign keys, not attributes that transitively determine other columns.

### PRESCRIPTION
- **Status:** Required a change.
- **Issue:** An early draft included `patient_name` and `doctor_name` directly in PRESCRIPTION (carried over from a flat design). Both are facts about the patient and doctor respectively — not about the prescription — making them transitive dependencies via `patient_id` and `doctor_id`.
- **Change:** `patient_name` and `doctor_name` were removed. Names are retrieved via JOIN with the USER table through PATIENT and DOCTOR when needed.
- **Why:** Storing names in PRESCRIPTION would cause data duplication and update anomalies. If a user changes their name, every prescription row would need updating.

---

## Step 2 — Duplicate and Redundancy Check

| Table | Finding | Action |
|---|---|---|
| USER | `name` appears only once | No change |
| PRESCRIPTION | Early draft duplicated `doctor_id` and `patient_id` that were already derivable through `appointment_id` | Kept them as explicit foreign keys for query performance; documented as intentional denormalization |
| PRESCRIPTION | `patient_name`, `doctor_name` removed (3NF fix above) | Removed |
| DOCTOR | `clinic_address` removed (3NF fix above) | Removed |
| PATIENT | `medical_history` restructured from multi-value to free-text | Restructured |

---

## Final Schema Summary

All six tables — USER, DOCTOR, PATIENT, MEDICINE, APPOINTMENT, PRESCRIPTION — satisfy 1NF, 2NF, and 3NF after the changes documented above.

The retention of `doctor_id` and `patient_id` in PRESCRIPTION alongside `appointment_id` is intentional: it avoids expensive multi-hop joins on frequently run queries (e.g. "all prescriptions by doctor X") and is a standard, accepted practice in relational database design at this scope.
