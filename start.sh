#!/bin/bash
docker build . --tag billing-storage
docker run --publish 8080:8080 --detach billing-storage:latest