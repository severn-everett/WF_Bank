INSERT INTO account(id, amount)
VALUES ('DevAccountEmpty', 0.0),
       ('DevAccountPositive', 25.0),
       ('DevAccountOverdraft', 0.0);

INSERT INTO transaction(account_id, type, serial_number, amount)
VALUES ('DevAccountPositive', 'DEPOSIT', 1, 25.00),
       ('DevAccountPositive', 'WITHDRAWAL', 2, 75.00),
       ('DevAccountPositive', 'DEPOSIT', 3, 50.00),
       ('DevAccountPositive', 'DEPOSIT', 4, 200.00),
       ('DevAccountOverdraft', 'WITHDRAWAL', 1, 100.00),
       ('DevAccountOverdraft', 'WITHDRAWAL', 2, 50.00);
