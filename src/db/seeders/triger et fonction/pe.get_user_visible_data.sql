CREATE OR REPLACE FUNCTION pe.get_user_visible_data(
    target_user_code varchar(50), 
    viewer_relationship varchar(20) -- 'self', 'friend', 'public'
)
RETURNS TABLE(
    user_code varchar(50),
    user_name varchar(255),
    user_firstname varchar(255),
    user_img varchar(255),
    user_nick_name varchar(250),
    user_gender varchar(15),
    user_bio text,
    user_work varchar(250),
    user_language varchar(50),
    user_email varchar(255),
    user_contact varchar(50),
    user_address varchar(250)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.usr_code as user_code, 
        u.usr_name as user_name,
        u.usr_firstname as user_firstname,
        u.usr_img as user_img,
        CASE 
            WHEN viewer_relationship = 'self' THEN u.usr_nick_name
            WHEN COALESCE(ufv_nick_name.ufv_visibility, u.usr_default_visibility) IN ('public', 'friends') 
                 AND viewer_relationship IN ('friend', 'self') THEN u.usr_nick_name
            ELSE NULL
        END as user_nick_name,
        CASE 
            WHEN viewer_relationship = 'self' THEN u.usr_gender
            WHEN COALESCE(ufv_gender.ufv_visibility, u.usr_default_visibility) IN ('public', 'friends') 
                 AND viewer_relationship IN ('friend', 'self') THEN u.usr_gender
            ELSE NULL
        END as user_gender,
        CASE 
            WHEN viewer_relationship = 'self' THEN u.usr_bio
            WHEN COALESCE(ufv_bio.ufv_visibility, u.usr_default_visibility) IN ('public', 'friends') 
                 AND viewer_relationship IN ('friend', 'self') THEN u.usr_bio
            ELSE NULL
        END as user_bio,
        CASE 
            WHEN viewer_relationship = 'self' THEN u.usr_work
            WHEN COALESCE(ufv_work.ufv_visibility, u.usr_default_visibility) IN ('public', 'friends') 
                 AND viewer_relationship IN ('friend', 'self') THEN u.usr_work
            ELSE NULL
        END as user_work,
        CASE 
            WHEN viewer_relationship = 'self' THEN u.usr_language
            WHEN COALESCE(ufv_language.ufv_visibility, u.usr_default_visibility) IN ('public', 'friends') 
                 AND viewer_relationship IN ('friend', 'self') THEN u.usr_language
            ELSE NULL
        END as user_language,
        CASE 
            WHEN viewer_relationship = 'self' THEN u.usr_mail
            WHEN COALESCE(ufv_email.ufv_visibility, u.usr_default_visibility) IN ('public', 'friends') 
                 AND viewer_relationship IN ('friend', 'self') THEN u.usr_mail
            ELSE NULL
        END as user_email,
        CASE 
            WHEN viewer_relationship = 'self' THEN u.usr_contact
            WHEN COALESCE(ufv_contact.ufv_visibility, u.usr_default_visibility) IN ('public', 'friends') 
                 AND viewer_relationship IN ('friend', 'self') THEN u.usr_contact
            ELSE NULL
        END as user_contact,
        CASE 
            WHEN viewer_relationship = 'self' THEN u.usr_addresse
            WHEN COALESCE(ufv_address.ufv_visibility, u.usr_default_visibility) IN ('public', 'friends') 
                 AND viewer_relationship IN ('friend', 'self') THEN u.usr_addresse
            ELSE NULL
        END as user_address
    FROM pe.users u
    LEFT JOIN pe.user_field_visibility ufv_email ON u.usr_code = ufv_email.usr_code AND ufv_email.ufv_field_name = 'usr_mail'
    LEFT JOIN pe.user_field_visibility ufv_contact ON u.usr_code = ufv_contact.usr_code AND ufv_contact.ufv_field_name = 'usr_contact'
    LEFT JOIN pe.user_field_visibility ufv_address ON u.usr_code = ufv_address.usr_code AND ufv_address.ufv_field_name = 'usr_addresse'
    LEFT JOIN pe.user_field_visibility ufv_nick_name ON u.usr_code = ufv_nick_name.usr_code AND ufv_nick_name.ufv_field_name = 'usr_nick_name'
    LEFT JOIN pe.user_field_visibility ufv_gender ON u.usr_code = ufv_gender.usr_code AND ufv_gender.ufv_field_name = 'usr_gender'
    LEFT JOIN pe.user_field_visibility ufv_bio ON u.usr_code = ufv_bio.usr_code AND ufv_bio.ufv_field_name = 'usr_bio'
    LEFT JOIN pe.user_field_visibility ufv_work ON u.usr_code = ufv_work.usr_code AND ufv_work.ufv_field_name = 'usr_work'
    LEFT JOIN pe.user_field_visibility ufv_language ON u.usr_code = ufv_language.usr_code AND ufv_language.ufv_field_name = 'usr_language'
    WHERE u.usr_code = target_user_code;
END;
$$ LANGUAGE plpgsql;