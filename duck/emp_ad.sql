WITH date_calc AS (
    SELECT STRFTIME(date_add(CAST(current_date() AS DATE), INTERVAL 1 DAY), '%Y-%m-%d') AS effective_date
)
-- Query 1: พนักงานปกติ
SELECT 
    CONCAT(ec.Mapping_Value, RIGHT(e."Employee ID", 5)) AS PERSON_ID,
    e."Employee ID" AS EMPLOYEE_NUMBER,
    e."First Name (Global)" AS FIRST_NAME,
    e."Last Name (Global)" AS LAST_NAME,
    e."Title (Global)" AS TITLE,
    COALESCE(m."Office Email CardX", e."Office Email") AS EMAIL_ADDRESS,
    NULL AS JOB_TITLE,
    e."Level Code (Description)" AS COPORATE_TITLE,
    e."Business Unit Code" AS ORGANIZATION_ID,
    NULL AS OFFICE_BUILDING,
    NULL AS OFFICE_FLOOR,
    NULL AS OFFICE_ZONE,
    NULL AS OFFICE_ROOM,
    '9' AS LOCATION_ADDRESS_NO,
    'Ratchadaphisek Road' AS LOCATION_ROAD,
    'Chatuchak' AS LOCATION_SUB_DISTRICT,
    'Chatuchak' AS LOCATION_DISTRICT,
    'Bangkok' AS LOCATION_STATE_PROVINCE,
    'TH' AS LOCATION_COUNTRY,
    '10900' AS LOCATION_POSTAL_CODE,
    NULL AS PHONE_NUMBER,
    NULL AS MOBILE_NUMBER,
    NULL AS FAX_NUMBER,
    NULL AS PAGER_NUMBER,
    dc.effective_date AS EFFECTIVE_START_DATE,
    '2999-12-31' AS EFFECTIVE_END_DATE,
    dc.effective_date AS LAST_UPDATE_DATE,
    e."Category Code (Description)" AS STATUS,
    e."First Name (Global)" AS MIDDLE_NAMES,
    STRFTIME(CAST(e."Join Date" AS DATE), '%Y-%m-%d') AS HIRE_DATE,
    e."Title (Local)" AS TITLE_TH,
    e."First Name (Local)" AS FIRST_NAME_TH,
    e."Last Name (Local)" AS LAST_NAME_TH,
    NULL AS JOB_CODE,
    CASE WHEN e."Employee ID" = 'CX00001' THEN 'CX00001' ELSE e."Supervisor" END AS SUPERVISOR_NO,
    CASE WHEN e."Employee ID" = 'CX00001' THEN 'CX00001' ELSE e."Supervisor" END AS EVPUP_NO,
    NULL AS YOS,
    NULL AS CORP_SEQUENCE,
    e."Level Code (Description)" AS CORPORATE_TITLE_TH,
    NULL AS JOB_TITLE_TH,
    'N' AS ON_LEAVE,
    NULL AS ACTUAL_TERMINATION_DATE,
    'ACTIVE' AS EMPLOYEE_STATUS,
    CASE WHEN e."Employee ID" = 'CX00001' THEN 'CX00001' ELSE e."Supervisor" END AS SVPUP_NO
FROM read_csv_auto('datasource/emp_profile.csv') AS e
CROSS JOIN date_calc dc
LEFT JOIN read_csv_auto('datasource/email_mapping.csv') AS m
    ON e."Office Email" = m."Office Email SCB"
LEFT JOIN read_csv_auto('datasource/emp_category.csv') AS ec
    ON ec.Prefix_Map = LEFT(e."Employee ID", 2)
WHERE (e."Termination Date" IS NULL OR e."Termination Date" >= current_date())
    AND e."Employee ID" != 'DUMMY'
    AND e."Company Code" != 'AX001'
    AND (e."Level Code (Description)" != 'BOD' 
         OR (e."Level Code (Description)" = 'BOD' AND e."Employee ID" = 'CT90010'))

UNION ALL

-- Query 2: พนักงาน Outsource
SELECT 
    CONCAT(ec.Mapping_Value, RIGHT(ne.EMPLOYEE_NUMBER, 5)) AS PERSON_ID,
    ne.EMPLOYEE_NUMBER,
    ne.FIRST_NAME,
    ne.LAST_NAME,
    COALESCE(ne.TITLE, 'Khun') AS TITLE,
    COALESCE(ne.EMAIL_ADDRESS, '') AS EMAIL_ADDRESS,  -- เพิ่ม default value
    NULL AS JOB_TITLE,
    'Outsource' AS COPORATE_TITLE,
    e."Business Unit Code" AS ORGANIZATION_ID,
    NULL AS OFFICE_BUILDING,
    NULL AS OFFICE_FLOOR,
    NULL AS OFFICE_ZONE,
    NULL AS OFFICE_ROOM,
    '9' AS LOCATION_ADDRESS_NO,
    'Ratchadaphisek Road' AS LOCATION_ROAD,
    'Chatuchak' AS LOCATION_SUB_DISTRICT,
    'Chatuchak' AS LOCATION_DISTRICT,
    'Bangkok' AS LOCATION_STATE_PROVINCE,
    'TH' AS LOCATION_COUNTRY,
    '10900' AS LOCATION_POSTAL_CODE,
    NULL AS PHONE_NUMBER,
    NULL AS MOBILE_NUMBER,
    NULL AS FAX_NUMBER,
    NULL AS PAGER_NUMBER,
    dc.effective_date AS EFFECTIVE_START_DATE,  -- ✅ ใช้ CTE
    '2999-12-31' AS EFFECTIVE_END_DATE,
    dc.effective_date AS LAST_UPDATE_DATE,  -- ✅ ใช้ CTE
    'Outsource' AS STATUS,
    ne.FIRST_NAME AS MIDDLE_NAMES,
    STRFTIME(CAST(ne.HIRE_DATE AS DATE), '%Y-%m-%d') AS HIRE_DATE,
    COALESCE(ne.TITLE_TH, 'คุณ') AS TITLE_TH,
    COALESCE(ne.FIRST_NAME_TH, ne.FIRST_NAME) AS FIRST_NAME_TH,
    COALESCE(ne.LAST_NAME_TH, ne.LAST_NAME) AS LAST_NAME_TH,
    NULL AS JOB_CODE,
    ne.SUPERVISOR_NO,
    ne.SUPERVISOR_NO AS EVPUP_NO,
    NULL AS YOS,
    NULL AS CORP_SEQUENCE,
    'Outsource' AS CORPORATE_TITLE_TH,
    NULL AS JOB_TITLE_TH,
    'N' AS ON_LEAVE,
    NULL AS ACTUAL_TERMINATION_DATE,
    'ACTIVE' AS EMPLOYEE_STATUS,
    ne.SUPERVISOR_NO AS SVPUP_NO
FROM read_csv_auto('datasource/non_humatrix_profile.csv') ne
CROSS JOIN date_calc dc  -- ✅ เพิ่ม CROSS JOIN
LEFT JOIN read_csv_auto('datasource/emp_category.csv') AS ec
    ON ec.Prefix_Map = LEFT(ne.EMPLOYEE_NUMBER, 2)
LEFT JOIN read_csv_auto('datasource/emp_profile.csv') AS e
    ON ne.SUPERVISOR_NO = e."Employee ID";