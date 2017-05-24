CREATE TABLE student (
  id serial PRIMARY KEY,
  username text UNIQUE,
  email text UNIQUE,
  password text,
  first_name text,
  last_name text,
  rating integer
);

CREATE TABLE class (
  id serial PRIMARY KEY,
  name text,
  room text
);

CREATE TABLE enrollment (
  id serial PRIMARY KEY,
  date_completed DATE,
  student_id integer REFERENCES student (id),
  class_id integer REFERENCES class (id)
);

CREATE TABLE make_appointment (
  id serial PRIMARY KEY,
  appointment_date DATE,
  category text,
  location text
);

CREATE TABLE RSVP (
  id serial PRIMARY KEY,
  accept BOOLEAN,
  make_appointment_id integer REFERENCES make_appointment (id),
  student_id integer REFERENCES student (id)
);
