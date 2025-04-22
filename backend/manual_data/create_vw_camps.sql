create or replace view vw_camps as
	select c.program_id, 
			c.week_of,
            c.price,
			i.institute_id,	
            i.institute_nm,	
            i.institute_info,	
            i.institute_url,	
            i.address,
            i.enroll_link,
            p.program_nm,	
            p.program_info,	
            p.program_url,
            p.min_age,	
            p.max_age,	
            p.category,	
            p.rating,	
            p.image_url
		from csm.camp_details c
			left join csm.programs p on c.program_id = p.program_id
			left join csm.institutes i on p.institute_id = i.institute_id
