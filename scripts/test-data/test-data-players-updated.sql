-- Test data for player and playerEventInterest tables
-- 75 players for organization: ecdbff0d-543a-4bcf-b565-56a53e54cda2
-- Each player has exactly one rating (1-5) for each of the 5 events
-- 45 male players, 30 female players

DO $$
DECLARE
    org_id UUID := 'ecdbff0d-543a-4bcf-b565-56a53e54cda2';
    event_year_id UUID := 'bb6ef123-b93f-44e3-9c9d-0ea4c3d3471e';
    player_ids UUID[];
    events eventtype[] := ARRAY['beach_volleyball', 'tug_of_war', 'corn_toss', 'beach_dodgeball', 'bote_beach_challenge'];
    ratings INTEGER[] := ARRAY[1, 2, 3, 4, 5];
    shuffled_ratings INTEGER[];
    i INTEGER;
    j INTEGER;
    current_player_id UUID;
BEGIN

    -- Insert 75 test players (45 male, 30 female)
    INSERT INTO "player" (
        id,
        "organizationId",
        "eventYearId",
        "firstName",
        "lastName",
        "dateOfBirth",
        email,
        phone,
        gender,
        "tshirtSize",
        status,
        "accuracyConfirmed",
        "waiverSigned",
        "createdAt",
        "updatedAt"
    ) VALUES
    -- Male players (45 total)
    (gen_random_uuid(), org_id, event_year_id, 'James', 'Anderson', '1990-03-15', 'janderson@laybl-labs.com', '+1555-0101', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Michael', 'Johnson', '1988-07-22', 'mjohnson@laybl-labs.com', '+1555-0102', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Robert', 'Williams', '1992-11-08', 'rwilliams@laybl-labs.com', '+1555-0103', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'William', 'Brown', '1985-02-14', 'wbrown@laybl-labs.com', '+1555-0104', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'David', 'Jones', '1991-09-30', 'djones@laybl-labs.com', '+1555-0105', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Richard', 'Garcia', '1993-05-18', 'rgarcia@laybl-labs.com', '+1555-0106', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Joseph', 'Miller', '1989-12-03', 'jmiller@laybl-labs.com', '+1555-0107', 'male', 'xxl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Thomas', 'Davis', '1987-08-27', 'tdavis@laybl-labs.com', '+1555-0108', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Christopher', 'Rodriguez', '1994-04-11', 'crodriguez@laybl-labs.com', '+1555-0109', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Charles', 'Wilson', '1986-10-05', 'cwilson@laybl-labs.com', '+1555-0110', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Daniel', 'Martinez', '1992-01-20', 'dmartinez@laybl-labs.com', '+1555-0111', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Matthew', 'Taylor', '1990-06-12', 'mtaylor@laybl-labs.com', '+1555-0112', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Anthony', 'Thomas', '1988-09-08', 'athomas@laybl-labs.com', '+1555-0113', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Mark', 'Hernandez', '1995-12-25', 'mhernandez@laybl-labs.com', '+1555-0114', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Donald', 'Moore', '1984-03-14', 'dmoore@laybl-labs.com', '+1555-0115', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Steven', 'Martin', '1991-11-09', 'smartin@laybl-labs.com', '+1555-0116', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Paul', 'Jackson', '1993-07-16', 'pjackson@laybl-labs.com', '+1555-0117', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Andrew', 'Thompson', '1987-04-03', 'athompson@laybl-labs.com', '+1555-0118', 'male', 'xxl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Joshua', 'White', '1989-12-18', 'jwhite@laybl-labs.com', '+1555-0119', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Kenneth', 'Lopez', '1992-08-21', 'klopez@laybl-labs.com', '+1555-0120', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Kevin', 'Lee', '1990-05-14', 'klee@laybl-labs.com', '+1555-0121', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Brian', 'Gonzalez', '1986-01-07', 'bgonzalez@laybl-labs.com', '+1555-0122', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'George', 'Harris', '1994-10-29', 'gharris@laybl-labs.com', '+1555-0123', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Timothy', 'Clark', '1988-06-24', 'tclark@laybl-labs.com', '+1555-0124', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Ronald', 'Lewis', '1991-02-11', 'rlewis@laybl-labs.com', '+1555-0125', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Jason', 'Robinson', '1993-09-17', 'jrobinson@laybl-labs.com', '+1555-0126', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Edward', 'Walker', '1987-12-04', 'ewalker@laybl-labs.com', '+1555-0127', 'male', 'xxl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Jeffrey', 'Perez', '1989-03-28', 'jperez@laybl-labs.com', '+1555-0128', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Ryan', 'Hall', '1995-11-15', 'rhall@laybl-labs.com', '+1555-0129', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Jacob', 'Young', '1990-07-02', 'jyoung@laybl-labs.com', '+1555-0130', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Gary', 'Allen', '1984-04-19', 'gallen@laybl-labs.com', '+1555-0131', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Nicholas', 'Sanchez', '1992-01-26', 'nsanchez@laybl-labs.com', '+1555-0132', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Eric', 'Wright', '1988-08-13', 'ewright@laybl-labs.com', '+1555-0133', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Jonathan', 'King', '1991-05-30', 'jking@laybl-labs.com', '+1555-0134', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Stephen', 'Scott', '1993-02-17', 'sscott@laybl-labs.com', '+1555-0135', 'male', 'xxl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Larry', 'Green', '1986-11-23', 'lgreen@laybl-labs.com', '+1555-0136', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Justin', 'Adams', '1994-09-10', 'jadams@laybl-labs.com', '+1555-0137', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Scott', 'Baker', '1989-04-06', 'sbaker@laybl-labs.com', '+1555-0138', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Brandon', 'Gonzales', '1992-10-22', 'bgonzales@laybl-labs.com', '+1555-0139', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Benjamin', 'Nelson', '1987-07-09', 'bnelson@laybl-labs.com', '+1555-0140', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Samuel', 'Carter', '1990-03-25', 'scarter@laybl-labs.com', '+1555-0141', 'male', 'xl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Gregory', 'Mitchell', '1985-12-12', 'gmitchell@laybl-labs.com', '+1555-0142', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Alexander', 'Perez', '1993-08-28', 'aperez@laybl-labs.com', '+1555-0143', 'male', 'xxl', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Patrick', 'Roberts', '1991-06-14', 'proberts@laybl-labs.com', '+1555-0144', 'male', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Frank', 'Turner', '1988-01-31', 'fturner@laybl-labs.com', '+1555-0145', 'male', 'l', 'confirmed', true, true, NOW(), NOW()),

    -- Female players (30 total)
    (gen_random_uuid(), org_id, event_year_id, 'Mary', 'Phillips', '1990-04-16', 'mphillips@laybl-labs.com', '+1555-0201', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Patricia', 'Campbell', '1992-08-23', 'pcampbell@laybl-labs.com', '+1555-0202', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Jennifer', 'Parker', '1988-12-09', 'jparker@laybl-labs.com', '+1555-0203', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Linda', 'Evans', '1985-03-15', 'levans@laybl-labs.com', '+1555-0204', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Elizabeth', 'Edwards', '1991-10-01', 'eedwards@laybl-labs.com', '+1555-0205', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Barbara', 'Collins', '1993-06-19', 'bcollins@laybl-labs.com', '+1555-0206', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Susan', 'Stewart', '1989-01-04', 'sstewart@laybl-labs.com', '+1555-0207', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Jessica', 'Sanchez', '1987-09-28', 'jsanchez@laybl-labs.com', '+1555-0208', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Sarah', 'Morris', '1994-05-12', 'smorris@laybl-labs.com', '+1555-0209', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Karen', 'Rogers', '1986-11-06', 'krogers@laybl-labs.com', '+1555-0210', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Nancy', 'Reed', '1992-02-21', 'nreed@laybl-labs.com', '+1555-0211', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Lisa', 'Cook', '1990-07-13', 'lcook@laybl-labs.com', '+1555-0212', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Betty', 'Bailey', '1988-10-09', 'bbailey@laybl-labs.com', '+1555-0213', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Helen', 'Rivera', '1995-01-26', 'hrivera@laybl-labs.com', '+1555-0214', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Sandra', 'Cooper', '1984-04-15', 'scooper@laybl-labs.com', '+1555-0215', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Donna', 'Richardson', '1991-12-10', 'drichardson@laybl-labs.com', '+1555-0216', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Carol', 'Cox', '1993-08-17', 'ccox@laybl-labs.com', '+1555-0217', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Ruth', 'Howard', '1987-05-04', 'rhoward@laybl-labs.com', '+1555-0218', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Sharon', 'Ward', '1989-01-19', 'sward@laybl-labs.com', '+1555-0219', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Michelle', 'Torres', '1992-11-16', 'mtorres@laybl-labs.com', '+1555-0220', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Laura', 'Peterson', '1990-06-03', 'lpeterson@laybl-labs.com', '+1555-0221', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Emily', 'Gray', '1986-02-18', 'egray@laybl-labs.com', '+1555-0222', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Kimberly', 'Ramirez', '1994-09-25', 'kramirez@laybl-labs.com', '+1555-0223', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Deborah', 'James', '1988-07-12', 'djames@laybl-labs.com', '+1555-0224', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Dorothy', 'Watson', '1991-03-29', 'dwatson@laybl-labs.com', '+1555-0225', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Lisa', 'Brooks', '1985-12-14', 'lbrooks@laybl-labs.com', '+1555-0226', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Amy', 'Kelly', '1993-10-07', 'akelly@laybl-labs.com', '+1555-0227', 'female', 'm', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Angela', 'Sanders', '1987-04-24', 'asanders@laybl-labs.com', '+1555-0228', 'female', 'l', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Ashley', 'Price', '1992-01-11', 'aprice@laybl-labs.com', '+1555-0229', 'female', 's', 'confirmed', true, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, event_year_id, 'Brenda', 'Bennett', '1990-08-28', 'bbennett@laybl-labs.com', '+1555-0230', 'female', 'm', 'confirmed', true, true, NOW(), NOW());

    -- Get all player IDs for event interest assignment
    SELECT array_agg(id) INTO player_ids
    FROM "player"
    WHERE "organizationId" = org_id
    AND "eventYearId" = event_year_id
    AND email LIKE '%@laybl-labs.com';

    -- For each player, assign ratings 1-5 to the 5 events (no duplicates)
    FOR i IN 1..array_length(player_ids, 1) LOOP
        current_player_id := player_ids[i];
        
        -- Simple shuffle by generating a random permutation
        -- Use a different approach: select random ratings for each event
        DECLARE
            used_ratings BOOLEAN[] := ARRAY[FALSE, FALSE, FALSE, FALSE, FALSE];
            selected_rating INTEGER;
            attempts INTEGER;
        BEGIN
            -- Reset for each player
            shuffled_ratings := ARRAY[0, 0, 0, 0, 0];
            
            -- Assign each event a unique rating
            FOR event_idx IN 1..5 LOOP
                attempts := 0;
                LOOP
                    selected_rating := (RANDOM() * 5)::INTEGER + 1;
                    attempts := attempts + 1;
                    
                    -- If rating not used yet, assign it
                    IF NOT used_ratings[selected_rating] THEN
                        shuffled_ratings[event_idx] := selected_rating;
                        used_ratings[selected_rating] := TRUE;
                        EXIT;
                    END IF;
                    
                    -- Fallback to prevent infinite loop
                    IF attempts > 50 THEN
                        FOR fallback_rating IN 1..5 LOOP
                            IF NOT used_ratings[fallback_rating] THEN
                                shuffled_ratings[event_idx] := fallback_rating;
                                used_ratings[fallback_rating] := TRUE;
                                EXIT;
                            END IF;
                        END LOOP;
                        EXIT;
                    END IF;
                END LOOP;
            END LOOP;
        END;
        
        -- Insert the 5 event interests with shuffled ratings
        INSERT INTO "playerEventInterest" ("playerId", "eventType", "interestRating") VALUES
        (current_player_id, events[1], shuffled_ratings[1]),
        (current_player_id, events[2], shuffled_ratings[2]),
        (current_player_id, events[3], shuffled_ratings[3]),
        (current_player_id, events[4], shuffled_ratings[4]),
        (current_player_id, events[5], shuffled_ratings[5]);
    END LOOP;

    RAISE NOTICE 'Successfully inserted 75 players for organization: %', org_id;
    RAISE NOTICE 'Event Year ID: %', event_year_id;
    RAISE NOTICE 'Each player has exactly 5 event interests with ratings 1-5 (no duplicates)';

END $$;

-- Verification queries
SELECT
    p."firstName",
    p."lastName",
    p.email,
    p.gender,
    p."tshirtSize",
    COUNT(pei.id) as event_interests_count
FROM "player" p
LEFT JOIN "playerEventInterest" pei ON p.id = pei."playerId"
WHERE p."organizationId" = 'ecdbff0d-543a-4bcf-b565-56a53e54cda2'
  AND p.email LIKE '%@laybl-labs.com'
GROUP BY p.id, p."firstName", p."lastName", p.email, p.gender, p."tshirtSize"
ORDER BY p."firstName"
LIMIT 10;

-- Verify each player has exactly one of each rating (1-5)
SELECT
    p."firstName",
    p."lastName",
    COUNT(CASE WHEN pei."interestRating" = 1 THEN 1 END) as rating_1_count,
    COUNT(CASE WHEN pei."interestRating" = 2 THEN 1 END) as rating_2_count,
    COUNT(CASE WHEN pei."interestRating" = 3 THEN 1 END) as rating_3_count,
    COUNT(CASE WHEN pei."interestRating" = 4 THEN 1 END) as rating_4_count,
    COUNT(CASE WHEN pei."interestRating" = 5 THEN 1 END) as rating_5_count,
    COUNT(pei.id) as total_interests
FROM "player" p
LEFT JOIN "playerEventInterest" pei ON p.id = pei."playerId"
WHERE p."organizationId" = 'ecdbff0d-543a-4bcf-b565-56a53e54cda2'
  AND p.email LIKE '%@laybl-labs.com'
GROUP BY p.id, p."firstName", p."lastName"
ORDER BY p."firstName"
LIMIT 5;

-- Show event type distribution with rating breakdown
SELECT
    pei."eventType",
    COUNT(*) as player_count,
    COUNT(CASE WHEN pei."interestRating" = 1 THEN 1 END) as most_interested,
    COUNT(CASE WHEN pei."interestRating" = 2 THEN 1 END) as very_interested,
    COUNT(CASE WHEN pei."interestRating" = 3 THEN 1 END) as moderately_interested,
    COUNT(CASE WHEN pei."interestRating" = 4 THEN 1 END) as somewhat_interested,
    COUNT(CASE WHEN pei."interestRating" = 5 THEN 1 END) as least_interested,
    ROUND(AVG(pei."interestRating"), 2) as avg_interest_rating
FROM "playerEventInterest" pei
JOIN "player" p ON pei."playerId" = p.id
WHERE p."organizationId" = 'ecdbff0d-543a-4bcf-b565-56a53e54cda2'
  AND p.email LIKE '%@laybl-labs.com'
GROUP BY pei."eventType"
ORDER BY pei."eventType";

-- Gender distribution
SELECT
    p.gender,
    COUNT(*) as count
FROM "player" p
WHERE p."organizationId" = 'ecdbff0d-543a-4bcf-b565-56a53e54cda2'
  AND p.email LIKE '%@laybl-labs.com'
GROUP BY p.gender;

-- T-shirt size distribution
SELECT
    p."tshirtSize",
    COUNT(*) as count
FROM "player" p
WHERE p."organizationId" = 'ecdbff0d-543a-4bcf-b565-56a53e54cda2'
  AND p.email LIKE '%@laybl-labs.com'
GROUP BY p."tshirtSize"
ORDER BY p."tshirtSize";
