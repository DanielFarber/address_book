CREATE TABLE categories(
  id serial primary key,
  name varchar(255)
);

CREATE TABLE contacts(
  id serial primary key,
  name varchar(255),
  age integer,
  address varchar(255),
  phone_number varchar(255),
  picture text,
  category_id integer
);
