-- Test Data: The Office Characters
-- Organization: LAYBL Labs (17799639-b034-40e0-b8bd-6a5cc3790839)
-- Event Year: Corporate SportsFest 2026 (bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e)
-- 30 characters from The Office with event interests

-- Insert Players
INSERT INTO player (id, "organizationId", "eventYearId", "firstName", "lastName", "dateOfBirth", email, phone, gender, "tshirtSize", "accuracyConfirmed", "waiverSigned", status) VALUES
-- 1. Michael Scott - Regional Manager
('00000000-0000-0000-0000-000000000001', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Michael', 'Scott', '1970-03-15', 'michael.scott@dundermifflin.com', '5555555501', 'male', 'm', true, true, 'confirmed'),

-- 2. Dwight Schrute - Assistant Regional Manager
('00000000-0000-0000-0000-000000000002', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Dwight', 'Schrute', '1975-01-20', 'dwight.schrute@dundermifflin.com', '5555555502', 'male', 'l', true, true, 'confirmed'),

-- 3. Jim Halpert - Salesman
('00000000-0000-0000-0000-000000000003', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Jim', 'Halpert', '1978-10-01', 'jim.halpert@dundermifflin.com', '5555555503', 'male', 'l', true, true, 'confirmed'),

-- 4. Pam Beesly - Receptionist
('00000000-0000-0000-0000-000000000004', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Pam', 'Beesly', '1979-03-25', 'pam.beesly@dundermifflin.com', '5555555504', 'female', 's', true, true, 'confirmed'),

-- 5. Ryan Howard - Temp
('00000000-0000-0000-0000-000000000005', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Ryan', 'Howard', '1985-05-05', 'ryan.howard@dundermifflin.com', '5555555505', 'male', 's', true, true, 'confirmed'),

-- 6. Andy Bernard - Salesman
('00000000-0000-0000-0000-000000000006', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Andy', 'Bernard', '1973-01-23', 'andy.bernard@dundermifflin.com', '5555555506', 'male', 'm', true, true, 'confirmed'),

-- 7. Robert California - CEO
('00000000-0000-0000-0000-000000000007', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Robert', 'California', '1963-11-05', 'robert.california@dundermifflin.com', '5555555507', 'male', 'l', true, true, 'confirmed'),

-- 8. Stanley Hudson - Salesman
('00000000-0000-0000-0000-000000000008', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Stanley', 'Hudson', '1958-02-19', 'stanley.hudson@dundermifflin.com', '5555555508', 'male', 'xl', true, true, 'confirmed'),

-- 9. Kevin Malone - Accountant
('00000000-0000-0000-0000-000000000009', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Kevin', 'Malone', '1968-06-01', 'kevin.malone@dundermifflin.com', '5555555509', 'male', 'xxl', true, true, 'confirmed'),

-- 10. Meredith Palmer - Supplier Relations
('00000000-0000-0000-0000-000000000010', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Meredith', 'Palmer', '1959-11-12', 'meredith.palmer@dundermifflin.com', '5555555510', 'female', 'm', true, true, 'confirmed'),

-- 11. Angela Martin - Accountant
('00000000-0000-0000-0000-000000000011', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Angela', 'Martin', '1974-11-11', 'angela.martin@dundermifflin.com', '5555555511', 'female', 'xs', true, true, 'confirmed'),

-- 12. Oscar Martinez - Accountant
('00000000-0000-0000-0000-000000000012', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Oscar', 'Martinez', '1972-11-18', 'oscar.martinez@dundermifflin.com', '5555555512', 'male', 'm', true, true, 'confirmed'),

-- 13. Phyllis Vance - Salesman
('00000000-0000-0000-0000-000000000013', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Phyllis', 'Vance', '1951-07-10', 'phyllis.vance@dundermifflin.com', '5555555513', 'female', 'l', true, true, 'confirmed'),

-- 14. Kelly Kapoor - Customer Service
('00000000-0000-0000-0000-000000000014', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Kelly', 'Kapoor', '1980-02-05', 'kelly.kapoor@dundermifflin.com', '5555555514', 'female', 's', true, true, 'confirmed'),

-- 15. Toby Flenderson - HR
('00000000-0000-0000-0000-000000000015', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Toby', 'Flenderson', '1971-02-22', 'toby.flenderson@dundermifflin.com', '5555555515', 'male', 'm', true, true, 'confirmed'),

-- 16. Creed Bratton - Quality Assurance
('00000000-0000-0000-0000-000000000016', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Creed', 'Bratton', '1943-02-08', 'creed.bratton@dundermifflin.com', '5555555516', 'male', 'm', true, true, 'confirmed'),

-- 17. Darryl Philbin - Warehouse Foreman
('00000000-0000-0000-0000-000000000017', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Darryl', 'Philbin', '1971-10-03', 'darryl.philbin@dundermifflin.com', '5555555517', 'male', 'xl', true, true, 'confirmed'),

-- 18. Erin Hannon - Receptionist
('00000000-0000-0000-0000-000000000018', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Erin', 'Hannon', '1986-05-01', 'erin.hannon@dundermifflin.com', '5555555518', 'female', 's', true, true, 'confirmed'),

-- 19. Gabe Lewis - Coordinating Director
('00000000-0000-0000-0000-000000000019', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Gabe', 'Lewis', '1982-08-19', 'gabe.lewis@dundermifflin.com', '5555555519', 'male', 's', true, true, 'confirmed'),

-- 20. Jan Levinson - VP
('00000000-0000-0000-0000-000000000020', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Jan', 'Levinson', '1965-04-14', 'jan.levinson@dundermifflin.com', '5555555520', 'female', 'm', true, true, 'confirmed'),

-- 21. David Wallace - CFO
('00000000-0000-0000-0000-000000000021', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'David', 'Wallace', '1963-05-20', 'david.wallace@dundermifflin.com', '5555555521', 'male', 'l', true, true, 'confirmed'),

-- 22. Holly Flax - HR
('00000000-0000-0000-0000-000000000022', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Holly', 'Flax', '1974-09-07', 'holly.flax@dundermifflin.com', '5555555522', 'female', 's', true, true, 'confirmed'),

-- 23. Karen Filippelli - Salesman
('00000000-0000-0000-0000-000000000023', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Karen', 'Filippelli', '1978-12-11', 'karen.filippelli@dundermifflin.com', '5555555523', 'female', 's', true, true, 'confirmed'),

-- 24. Roy Anderson - Warehouse
('00000000-0000-0000-0000-000000000024', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Roy', 'Anderson', '1976-08-18', 'roy.anderson@dundermifflin.com', '5555555524', 'male', 'xl', true, true, 'confirmed'),

-- 25. Todd Packer - Salesman
('00000000-0000-0000-0000-000000000025', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Todd', 'Packer', '1968-02-02', 'todd.packer@dundermifflin.com', '5555555525', 'male', 'l', true, true, 'confirmed'),

-- 26. Nellie Bertram - Special Projects Manager
('00000000-0000-0000-0000-000000000026', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Nellie', 'Bertram', '1970-07-29', 'nellie.bertram@dundermifflin.com', '5555555526', 'female', 'm', true, true, 'confirmed'),

-- 27. Pete Miller - Customer Service
('00000000-0000-0000-0000-000000000027', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Pete', 'Miller', '1984-03-16', 'pete.miller@dundermifflin.com', '5555555527', 'male', 'm', true, true, 'confirmed'),

-- 28. Clark Green - Customer Service
('00000000-0000-0000-0000-000000000028', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Clark', 'Green', '1983-11-22', 'clark.green@dundermifflin.com', '5555555528', 'male', 'm', true, true, 'confirmed'),

-- 29. Jo Bennett - CEO
('00000000-0000-0000-0000-000000000029', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'Jo', 'Bennett', '1952-06-15', 'jo.bennett@dundermifflin.com', '5555555529', 'female', 'l', true, true, 'confirmed'),

-- 30. DeAngelo Vickers - Manager
('00000000-0000-0000-0000-000000000030', '17799639-b034-40e0-b8bd-6a5cc3790839', 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e', 'DeAngelo', 'Vickers', '1965-04-09', 'deangelo.vickers@dundermifflin.com', '5555555530', 'male', 'xl', true, true, 'confirmed');


-- Insert Player Event Interests
-- Each player gets 5 entries (one for each event type) with unique ratings 1-5
-- Events: beach_volleyball, tug_of_war, corn_toss, bote_beach_challenge, beach_dodgeball

INSERT INTO "playerEventInterest" ("playerId", "eventType", "interestRating") VALUES
-- Michael Scott
('00000000-0000-0000-0000-000000000001', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000001', 'tug_of_war', 2),
('00000000-0000-0000-0000-000000000001', 'corn_toss', 3),
('00000000-0000-0000-0000-000000000001', 'bote_beach_challenge', 4),
('00000000-0000-0000-0000-000000000001', 'beach_dodgeball', 5),

-- Dwight Schrute
('00000000-0000-0000-0000-000000000002', 'tug_of_war', 1),
('00000000-0000-0000-0000-000000000002', 'beach_dodgeball', 2),
('00000000-0000-0000-0000-000000000002', 'bote_beach_challenge', 3),
('00000000-0000-0000-0000-000000000002', 'beach_volleyball', 4),
('00000000-0000-0000-0000-000000000002', 'corn_toss', 5),

-- Jim Halpert
('00000000-0000-0000-0000-000000000003', 'corn_toss', 1),
('00000000-0000-0000-0000-000000000003', 'beach_volleyball', 2),
('00000000-0000-0000-0000-000000000003', 'beach_dodgeball', 3),
('00000000-0000-0000-0000-000000000003', 'tug_of_war', 4),
('00000000-0000-0000-0000-000000000003', 'bote_beach_challenge', 5),

-- Pam Beesly
('00000000-0000-0000-0000-000000000004', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000004', 'corn_toss', 2),
('00000000-0000-0000-0000-000000000004', 'beach_dodgeball', 3),
('00000000-0000-0000-0000-000000000004', 'bote_beach_challenge', 4),
('00000000-0000-0000-0000-000000000004', 'tug_of_war', 5),

-- Ryan Howard
('00000000-0000-0000-0000-000000000005', 'bote_beach_challenge', 1),
('00000000-0000-0000-0000-000000000005', 'beach_dodgeball', 2),
('00000000-0000-0000-0000-000000000005', 'beach_volleyball', 3),
('00000000-0000-0000-0000-000000000005', 'corn_toss', 4),
('00000000-0000-0000-0000-000000000005', 'tug_of_war', 5),

-- Andy Bernard
('00000000-0000-0000-0000-000000000006', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000006', 'beach_dodgeball', 2),
('00000000-0000-0000-0000-000000000006', 'tug_of_war', 3),
('00000000-0000-0000-0000-000000000006', 'corn_toss', 4),
('00000000-0000-0000-0000-000000000006', 'bote_beach_challenge', 5),

-- Robert California
('00000000-0000-0000-0000-000000000007', 'bote_beach_challenge', 1),
('00000000-0000-0000-0000-000000000007', 'beach_volleyball', 2),
('00000000-0000-0000-0000-000000000007', 'tug_of_war', 3),
('00000000-0000-0000-0000-000000000007', 'beach_dodgeball', 4),
('00000000-0000-0000-0000-000000000007', 'corn_toss', 5),

-- Stanley Hudson
('00000000-0000-0000-0000-000000000008', 'corn_toss', 1),
('00000000-0000-0000-0000-000000000008', 'tug_of_war', 2),
('00000000-0000-0000-0000-000000000008', 'beach_volleyball', 3),
('00000000-0000-0000-0000-000000000008', 'beach_dodgeball', 4),
('00000000-0000-0000-0000-000000000008', 'bote_beach_challenge', 5),

-- Kevin Malone
('00000000-0000-0000-0000-000000000009', 'beach_dodgeball', 1),
('00000000-0000-0000-0000-000000000009', 'corn_toss', 2),
('00000000-0000-0000-0000-000000000009', 'tug_of_war', 3),
('00000000-0000-0000-0000-000000000009', 'beach_volleyball', 4),
('00000000-0000-0000-0000-000000000009', 'bote_beach_challenge', 5),

-- Meredith Palmer
('00000000-0000-0000-0000-000000000010', 'beach_dodgeball', 1),
('00000000-0000-0000-0000-000000000010', 'tug_of_war', 2),
('00000000-0000-0000-0000-000000000010', 'corn_toss', 3),
('00000000-0000-0000-0000-000000000010', 'bote_beach_challenge', 4),
('00000000-0000-0000-0000-000000000010', 'beach_volleyball', 5),

-- Angela Martin
('00000000-0000-0000-0000-000000000011', 'corn_toss', 1),
('00000000-0000-0000-0000-000000000011', 'beach_volleyball', 2),
('00000000-0000-0000-0000-000000000011', 'bote_beach_challenge', 3),
('00000000-0000-0000-0000-000000000011', 'beach_dodgeball', 4),
('00000000-0000-0000-0000-000000000011', 'tug_of_war', 5),

-- Oscar Martinez
('00000000-0000-0000-0000-000000000012', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000012', 'corn_toss', 2),
('00000000-0000-0000-0000-000000000012', 'bote_beach_challenge', 3),
('00000000-0000-0000-0000-000000000012', 'tug_of_war', 4),
('00000000-0000-0000-0000-000000000012', 'beach_dodgeball', 5),

-- Phyllis Vance
('00000000-0000-0000-0000-000000000013', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000013', 'bote_beach_challenge', 2),
('00000000-0000-0000-0000-000000000013', 'corn_toss', 3),
('00000000-0000-0000-0000-000000000013', 'beach_dodgeball', 4),
('00000000-0000-0000-0000-000000000013', 'tug_of_war', 5),

-- Kelly Kapoor
('00000000-0000-0000-0000-000000000014', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000014', 'beach_dodgeball', 2),
('00000000-0000-0000-0000-000000000014', 'bote_beach_challenge', 3),
('00000000-0000-0000-0000-000000000014', 'corn_toss', 4),
('00000000-0000-0000-0000-000000000014', 'tug_of_war', 5),

-- Toby Flenderson
('00000000-0000-0000-0000-000000000015', 'corn_toss', 1),
('00000000-0000-0000-0000-000000000015', 'beach_volleyball', 2),
('00000000-0000-0000-0000-000000000015', 'tug_of_war', 3),
('00000000-0000-0000-0000-000000000015', 'bote_beach_challenge', 4),
('00000000-0000-0000-0000-000000000015', 'beach_dodgeball', 5),

-- Creed Bratton
('00000000-0000-0000-0000-000000000016', 'beach_dodgeball', 1),
('00000000-0000-0000-0000-000000000016', 'bote_beach_challenge', 2),
('00000000-0000-0000-0000-000000000016', 'tug_of_war', 3),
('00000000-0000-0000-0000-000000000016', 'corn_toss', 4),
('00000000-0000-0000-0000-000000000016', 'beach_volleyball', 5),

-- Darryl Philbin
('00000000-0000-0000-0000-000000000017', 'tug_of_war', 1),
('00000000-0000-0000-0000-000000000017', 'beach_dodgeball', 2),
('00000000-0000-0000-0000-000000000017', 'beach_volleyball', 3),
('00000000-0000-0000-0000-000000000017', 'bote_beach_challenge', 4),
('00000000-0000-0000-0000-000000000017', 'corn_toss', 5),

-- Erin Hannon
('00000000-0000-0000-0000-000000000018', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000018', 'corn_toss', 2),
('00000000-0000-0000-0000-000000000018', 'beach_dodgeball', 3),
('00000000-0000-0000-0000-000000000018', 'bote_beach_challenge', 4),
('00000000-0000-0000-0000-000000000018', 'tug_of_war', 5),

-- Gabe Lewis
('00000000-0000-0000-0000-000000000019', 'bote_beach_challenge', 1),
('00000000-0000-0000-0000-000000000019', 'corn_toss', 2),
('00000000-0000-0000-0000-000000000019', 'beach_volleyball', 3),
('00000000-0000-0000-0000-000000000019', 'beach_dodgeball', 4),
('00000000-0000-0000-0000-000000000019', 'tug_of_war', 5),

-- Jan Levinson
('00000000-0000-0000-0000-000000000020', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000020', 'bote_beach_challenge', 2),
('00000000-0000-0000-0000-000000000020', 'beach_dodgeball', 3),
('00000000-0000-0000-0000-000000000020', 'corn_toss', 4),
('00000000-0000-0000-0000-000000000020', 'tug_of_war', 5),

-- David Wallace
('00000000-0000-0000-0000-000000000021', 'corn_toss', 1),
('00000000-0000-0000-0000-000000000021', 'beach_volleyball', 2),
('00000000-0000-0000-0000-000000000021', 'bote_beach_challenge', 3),
('00000000-0000-0000-0000-000000000021', 'tug_of_war', 4),
('00000000-0000-0000-0000-000000000021', 'beach_dodgeball', 5),

-- Holly Flax
('00000000-0000-0000-0000-000000000022', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000022', 'corn_toss', 2),
('00000000-0000-0000-0000-000000000022', 'bote_beach_challenge', 3),
('00000000-0000-0000-0000-000000000022', 'beach_dodgeball', 4),
('00000000-0000-0000-0000-000000000022', 'tug_of_war', 5),

-- Karen Filippelli
('00000000-0000-0000-0000-000000000023', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000023', 'beach_dodgeball', 2),
('00000000-0000-0000-0000-000000000023', 'corn_toss', 3),
('00000000-0000-0000-0000-000000000023', 'bote_beach_challenge', 4),
('00000000-0000-0000-0000-000000000023', 'tug_of_war', 5),

-- Roy Anderson
('00000000-0000-0000-0000-000000000024', 'tug_of_war', 1),
('00000000-0000-0000-0000-000000000024', 'beach_dodgeball', 2),
('00000000-0000-0000-0000-000000000024', 'corn_toss', 3),
('00000000-0000-0000-0000-000000000024', 'beach_volleyball', 4),
('00000000-0000-0000-0000-000000000024', 'bote_beach_challenge', 5),

-- Todd Packer
('00000000-0000-0000-0000-000000000025', 'beach_dodgeball', 1),
('00000000-0000-0000-0000-000000000025', 'tug_of_war', 2),
('00000000-0000-0000-0000-000000000025', 'beach_volleyball', 3),
('00000000-0000-0000-0000-000000000025', 'corn_toss', 4),
('00000000-0000-0000-0000-000000000025', 'bote_beach_challenge', 5),

-- Nellie Bertram
('00000000-0000-0000-0000-000000000026', 'bote_beach_challenge', 1),
('00000000-0000-0000-0000-000000000026', 'beach_volleyball', 2),
('00000000-0000-0000-0000-000000000026', 'corn_toss', 3),
('00000000-0000-0000-0000-000000000026', 'beach_dodgeball', 4),
('00000000-0000-0000-0000-000000000026', 'tug_of_war', 5),

-- Pete Miller
('00000000-0000-0000-0000-000000000027', 'beach_volleyball', 1),
('00000000-0000-0000-0000-000000000027', 'corn_toss', 2),
('00000000-0000-0000-0000-000000000027', 'beach_dodgeball', 3),
('00000000-0000-0000-0000-000000000027', 'tug_of_war', 4),
('00000000-0000-0000-0000-000000000027', 'bote_beach_challenge', 5),

-- Clark Green
('00000000-0000-0000-0000-000000000028', 'beach_dodgeball', 1),
('00000000-0000-0000-0000-000000000028', 'beach_volleyball', 2),
('00000000-0000-0000-0000-000000000028', 'bote_beach_challenge', 3),
('00000000-0000-0000-0000-000000000028', 'corn_toss', 4),
('00000000-0000-0000-0000-000000000028', 'tug_of_war', 5),

-- Jo Bennett
('00000000-0000-0000-0000-000000000029', 'corn_toss', 1),
('00000000-0000-0000-0000-000000000029', 'bote_beach_challenge', 2),
('00000000-0000-0000-0000-000000000029', 'beach_volleyball', 3),
('00000000-0000-0000-0000-000000000029', 'tug_of_war', 4),
('00000000-0000-0000-0000-000000000029', 'beach_dodgeball', 5),

-- DeAngelo Vickers
('00000000-0000-0000-0000-000000000030', 'tug_of_war', 1),
('00000000-0000-0000-0000-000000000030', 'beach_volleyball', 2),
('00000000-0000-0000-0000-000000000030', 'beach_dodgeball', 3),
('00000000-0000-0000-0000-000000000030', 'corn_toss', 4),
('00000000-0000-0000-0000-000000000030', 'bote_beach_challenge', 5);