#! /bin/bash

docker run --name inventory_db-dev \
    -e POSTGRES_DB=inventory_db \
    -e POSTGRES_USER=inventory_user \
    -e POSTGRES_PASSWORD=dev-admin \
    -p 5432:5432 \
    -d postgres
