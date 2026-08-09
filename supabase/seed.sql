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

  -- Tiles (Mock data based on CTM website patterns)
  tiles_inserted as (
    insert into public.tiles (sku, description, price_per_sqm, price_per_box, box_coverage_sqm)
    values
      ('rarpc66003', 'Mystic Onyx Polished Hard Body', 179.90, 259.06, 1.44),
      ('vt1kfy20711a', 'Origins Fynbos Grey Matt Porcelain', 149.90, 213.86, 1.43),
      ('vt1kla31711', 'Origins Lagoon Wood Brown Matt Porcelain', 149.90, 213.86, 1.43),
      ('vt1kma11351a', 'Kilimanjaro Mazoni Ivory Matt Porcelain', 89.90, 128.26, 1.42),
      ('vt1kch00351a', 'Kilimanjaro Chwaka Slate Matt Porcelain', 104.90, 149.86, 1.42),
      ('vt1kch00353a', 'Kilimanjaro Chwaka Slate Slip Resistant', 114.90, 163.86, 1.42),
      ('vt1kts33301a', 'Kilimanjaro Edge Tshwane Wood Matt', 199.90, 287.86, 1.44),
      ('vt1kin20651a', 'Kilimanjaro Edge Inyathi Stone Grey Matt', 149.90, 213.86, 1.43),
      ('vt1kka12301a', 'Kilimanjaro Edge Kalua Wood Matt', 199.90, 287.86, 1.44),
      ('tile_10', 'Classic White Ceramic', 120.00, 172.80, 1.44),
      ('tile_11', 'Modern Grey Porcelain', 160.00, 230.40, 1.44),
      ('tile_12', 'Beige Travertine Look', 180.00, 259.20, 1.44),
      ('tile_13', 'Dark Slate Porcelain', 210.00, 302.40, 1.44),
      ('tile_14', 'Ivory Marble Look', 240.00, 345.60, 1.44),
      ('tile_15', 'Rustic Wood Plank', 150.00, 216.00, 1.44),
      ('tile_16', 'Cement Grey Matt', 130.00, 187.20, 1.44),
      ('tile_17', 'Sandstone Texture', 170.00, 244.80, 1.44),
      ('tile_18', 'Glossy Black Porcelain', 220.00, 316.80, 1.44),
      ('tile_19', 'Creamy Vanilla Ceramic', 110.00, 158.40, 1.44),
      ('tile_20', 'Ocean Blue Mosaic', 350.00, 504.00, 1.44)
    returning sku
  ),

  -- Areas
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

insert into public.surfaces (area_id, selected_tile, surface_length, surface_width, surface_height, name)
values
  ((select id from areas_inserted where name = 'Open patio' and house_id = (select id from h24) limit 1), 'rarpc66003', 3, 13, 2.6, 'North wall'),
  ((select id from areas_inserted where name = 'Open patio' and house_id = (select id from h24) limit 1), 'vt1kfy20711a', 6, 17, 2.6, 'East wall'),
  ((select id from areas_inserted where name = 'Open patio' and house_id = (select id from h24) limit 1), 'vt1kla31711', 2, 15, 2.6, 'South wall'),
  ((select id from areas_inserted where name = 'Bathroom 1' and house_id = (select id from h25) limit 1), 'vt1kma11351a', 5, 14, 2.6, 'West wall'),
  ((select id from areas_inserted where name = 'Bathroom 1' and house_id = (select id from h25) limit 1), 'vt1kch00351a', 7, 15, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'garage' and house_id = (select id from h26) limit 1), 'vt1kch00353a', 9, 14, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Kitchen' and house_id = (select id from h27) limit 1), 'vt1kts33301a', 8, 19, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Study' and house_id = (select id from h28) limit 1), 'vt1kin20651a', 1, 17, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Bedroom_2' and house_id = (select id from h29) limit 1), 'vt1kka12301a', 3, 16, 2.6, 'North wall'),
  ((select id from areas_inserted where name = 'Dining area' and house_id = (select id from h30) limit 1), 'tile_10', 4, 11, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Hallway' and house_id = (select id from h31) limit 1), 'tile_11', 9, 18, 2.6, 'Floor'),
  ((select id from areas_inserted where name = 'Spare toilet' and house_id = (select id from h32) limit 1), 'tile_12', 5, 17, 2.6, 'South wall'),
  ((select id from areas_inserted where name = 'Bedroom 1' and house_id = (select id from h33) limit 1), 'tile_13', 6, 12, 2.6, 'floor');
