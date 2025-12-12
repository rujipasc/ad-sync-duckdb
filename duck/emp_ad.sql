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
	STRFTIME(date_add(CAST(current_date() AS DATE), INTERVAL 1 DAY), '%Y-%m-%d') AS EFFECTIVE_START_DATE,
	'2999-12-31' AS EFFECTIVE_END_DATE,
	STRFTIME(date_add(CAST(current_date() AS DATE), INTERVAL 1 DAY), '%Y-%m-%d') AS LAST_UPDATE_DATE,
	e."Category Code (Description)" AS STATUS,
	e."First Name (Global)" AS MIDDLE_NAMES,
	STRFTIME(CAST(e."Join Date" AS DATE), '%Y-%m-%d') AS HIRE_DATE,
	e."Title (Local)" AS TITLE_TH,
	e."First Name (Local)" AS FIRST_NAME_TH,
	e."Last Name (Local)" AS LAST_NAME_TH,
	NULL AS JOB_CODE,
	IF(e."Employee ID" = 'CX00001', 'CX00001', e."Supervisor") AS SUPERVISOR_NO,
	IF(e."Employee ID" = 'CX00001', 'CX00001', e."Supervisor") AS EVPUP_NO,
	NULL AS YOS,
	NULL AS CORP_SEQUENCE,
	e."Level Code (Description)" AS CORPORATE_TITLE_TH,
	NULL AS JOB_TITLE_TH,
	'N' AS ON_LEAVE,
	NULL AS ACTUAL_TERMINATION_DATE,
	'ACTIVE' AS EMPLOYEE_STATUS,
	IF(e."Employee ID" = 'CX00001', 'CX00001', e."Supervisor") AS SVPUP_NO
FROM read_csv_auto('datasource/emp_profile.csv') AS e
LEFT JOIN read_csv_auto('datasource/email_mapping.csv') AS m
  ON e."Office Email" = m."Office Email SCB"
LEFT JOIN read_csv_auto('datasource/emp_Category.csv') AS ec
  ON ec.Prefix_Map = LEFT(e."Employee ID", 2)
WHERE (e."Termination Date" IS NULL OR e."Termination Date" >= current_date()) 
	AND e."Employee ID" != 'DUMMY'
	AND e."Company Code" != 'AX001'
	AND (
		 e."Level Code (Description)" != 'BOD' 
			OR (e."Level Code (Description)" = 'BOD' AND e."Employee ID" = 'CT90010')
	);