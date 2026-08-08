with 
  -- Houses
  h24 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('24', 'Kuun', '1234567890', 'Still to choose garage tiles') returning id),
  h25 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('25', 'Abel', '0123456789', '1') returning id),
  h26 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('26', 'Diedericks', '9012345678', '2') returning id),
  h27 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('27', 'Zulu', '8901234567', '3') returning id),
  h28 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('28', 'Molopa', '7890123456', '4') returning id),
  h29 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('29', 'Du Preez', '6789012345', '5') returning id),
  h30 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('30', 'Van Vuuren', '5678901234', '6') returning id),
  h31 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('31', 'Odendaal', '4567890123', '7') returning id),
  h32 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('32', 'Strydom', '3456789012', '8') returning id),
  h33 as (insert into public.houses (unit_number, client_surname, client_contact_number, notes) values ('33', 'Nkosi', '2345678901', '9') returning id),

  -- Areas (Inserted as a batch to allow multiple areas per house)
  areas_inserted as (
    insert into public.areas (house_id, name)
    values
      ((select id from h24), 'Open patio'),
      ((select id from h24), 'Open patio'),
      ((select id from h24), 'Open patio'),
      ((select id from h25), 'Bathroom 1'),
      ((select id from h25), 'Bathroom 1'),
      ((select id from h26), 'garage'),
      ((select id from h27), 'Kitchen'),
      ((select id from h28), 'Study'),
      ((select id from h29), 'Bedroom_2'),
      ((select id from h30), 'Dining area'),
      ((select id from h31), 'Hallway'),
      ((select id from h32), 'Spare toilet'),
      ((select id from h33), 'Bedroom 1')
    returning id, house_id, name
  )

insert into public.surfaces (area_id, surface_length, surface_width, surface_height, name)
values
  ((select id from areas_inserted where name = 'Open patio' and house_id = (select id from h24) limit 1), 3, 13, 2.6, 'North wall'),
  ((select id from areas_inserted where name = 'Open patio' and house_id = (select id from h24) limit 1), 6, 17, 2.6, 'East wall'),
  ((select id from areas_inserted where name = 'Open patio' and house_id = (select id from h24) limit 1), 2, 15, 2.6, 'South wall'),
  ((select id from areas_inserted where name = 'Bathroom 1' and house_id = (select id from h25) limit 1), 5, 14, 2.6, 'West wall'),
  ((select id from areas_inserted where name = 'Bathroom 1' and house_id = (select id from h25) limit 1), 7, 15, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'garage' and house_id = (select id from h26) limit 1), 9, 14, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Kitchen' and house_id = (select id from h27) limit 1), 8, 19, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Study' and house_id = (select id from h28) limit 1), 1, 17, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Bedroom_2' and house_id = (select id from h29) limit 1), 3, 16, 2.6, 'North wall'),
  ((select id from areas_inserted where name = 'Dining area' and house_id = (select id from h30) limit 1), 4, 11, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Hallway' and house_id = (select id from h31) limit 1), 9, 18, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Spare toilet' and house_id = (select id from h32) limit 1), 5, 17, 2.6, 'South wall'),
  ((select id from areas_inserted where name = 'Bedroom 1' and house_id = (select id from h33) limit 1), 6, 12, 2.6, 'floor');
