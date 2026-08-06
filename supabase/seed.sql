insert into public.houses (unit_number, client_surname, client_contact_number, notes)

values
  ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
  ('25', 'Abel', '0123456789', '1'),
  ('26', 'Diedericks', '9012345678', '2'),
  ('27', 'Zulu', '8901234567', '3'),
  ('28', 'Molopa', '7890123456', '4'),
  ('29', 'Du Preez', '6789012345', '5'),
  ('30', 'Van Vuuren', '5678901234', '6'),
  ('31', 'Odendaal', '4567890123', '7'),
  ('32', 'Strydom', '3456789012', '8'),
  ('33', 'Nkosi', '2345678901', '9');

insert into public.areas (house_id, name)

values
  ((select id from public.houses where unit_number = '24'), 'Open patio'),
  ((select id from public.houses where unit_number = '24'), 'Open patio'),
  ((select id from public.houses where unit_number = '24'), 'Open patio'),
  ((select id from public.houses where unit_number = '25'), 'Bathroom 1'),
  ((select id from public.houses where unit_number = '25'), 'Bathroom 1'),
  ((select id from public.houses where unit_number = '26'), 'garage'),
  ((select id from public.houses where unit_number = '27'), 'Kitchen'),
  ((select id from public.houses where unit_number = '28'), 'Study'),
  ((select id from public.houses where unit_number = '29'), 'Bedroom_2'),
  ((select id from public.houses where unit_number = '30'), 'Dining area'),
  ((select id from public.houses where unit_number = '31'), 'Hallway'),
  ((select id from public.houses where unit_number = '32'), 'Spare toilet'),
  ((select id from public.houses where unit_number = '33'), 'Bedroom 1');

-- insert into public.surface_types (name)
--
-- values
--   ('floor'),
--   ('wall');
-- on conflict (name) do nothing;

-- insert into public.surfaces (lengh, width, height, name, created_at, updated_at)
--
-- values
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles');
--
-- insert into public.tiles (unit_number, client_surname, client_contact_number, notes, created_at, updated_at)
--
-- values
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles');
--
-- insert into public.selections (unit_number, client_surname, client_contact_number, notes, created_at, updated_at)
--
-- values
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles'),
--   ('24', 'Kuun', '1234567890', 'Still to choose garage tiles');
--
