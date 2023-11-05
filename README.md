# WF Bank

## Description
The WF Bank is an application that exposes three endpoints in its API:
* `/deposit?accountId={string}&amount={number}` - Deposit a specified amount in an account
* `/withdraw?accountId={string}&amount={number}` - Withdraw a specified amount from an account
* `/transfer?fromAccountId={string}&toAccountId={number}&amount={number}` - Transfer a specified amount from one account to another

## Prerequisites
The following components must be installed in the runtime environment:
* Node
* Docker (or Podman)

## Runtime Instructions
* Execute `npm install` to install the requisite Node packages
* Navigate to `docker/` and execute `docker compose up`
* In the base project directory, execute `npm run db-migrate up` to create the database schema
  * Executing `npm run db-migrate up:testData` will populate the database with test data
* Execute `npm run buildAndStart` to compile the code and start the server
  * All endpoints will be available at `localhost:3300`

## Project Assumptions
* A transfer is treated as a deposit for the recipient account and will thus count against the daily deposit limit
* Requests that are directed to a non-existent account will be rejected - all accounts must be pre-existing for a
transaction to be valid

## Next Steps
* Implement unit testing
* Implement authentication
* Introduce API documentation generation via OpenAPI
