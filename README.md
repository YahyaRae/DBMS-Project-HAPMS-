# DBMS-Project-HAPMS-
HAPMS: Redefining Healthcare Logistics. 🚀 A scalable DBMS engineered to humanize patient workflows and maximize efficiency. Building the foundation for the next generation of healthcare automation. 🤝 Let’s connect to scale this.

HAPMS — Healthcare Appointment & Prescription Management System

Replacing clipboards and spreadsheets with a database that actually works.


The Problem
Most local clinics still run on paper. Appointments get double-booked. Prescriptions get lost. Patient history lives in a filing cabinet no one can search. Staff waste hours on admin work that should take seconds.
HAPMS fixes that.

What It Does
A web-based system that centralises everything a clinic needs to operate — patient records, doctor schedules, and digital prescriptions — in one clean relational database.
FeatureDescriptionAppointment BookingPatients book from available slots. No double-booking, ever.Digital PrescriptionsDoctors issue prescriptions linked to the appointment and patient record.Patient ProfilesFull history — blood group, past conditions, past prescriptions — searchable by ID or name.Doctor DashboardEach doctor sees their own schedule and patient queue.Role-Based AccessSeparate login flows for Doctors, Patients, and Admins.Automated ReportsWeekly summaries on patient volume and activity.

Tech Stack
LayerTechnologyFrontendReact.js / FlutterBackendNode.js (Express) or Python (Django)DatabasePostgreSQL / MySQLToolsVS Code, Git, DB Workbench

Database Schema
Six core entities. Clean relationships. No redundancy.
USER ──< DOCTOR ──< APPOINTMENT >── PATIENT >── USER
                        │
                   PRESCRIPTION >── MEDICINE
EntityPurposeUSERAuthentication and role managementDOCTORSpecialization, license, availabilityPATIENTDemographics and medical historyAPPOINTMENTBookings with double-booking preventionPRESCRIPTIONDigital prescriptions linked to appointmentsMEDICINEMedicine catalogue referenced by prescriptions
Full schema documentation → docs/HAPMS_Milestone1_Schema.docx

Project Status

Milestone 1 complete — ERD and relational schema defined.


 Entity-Relationship Diagram
 Relational schema with constraints
 Backend API
 Frontend UI
 Authentication system
 Deployment


Team
Name: Yahya Raees Khan (BSAI) Eshal Khan (BSAI) 

Why This Matters
Healthcare admin is a solved problem everywhere except where it needs solving most — small clinics with no budget for enterprise software. HAPMS is built to be simple enough to deploy fast and robust enough to actually trust with patient data.

Built as a semester project. Designed like it's going to production.
