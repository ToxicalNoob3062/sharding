#!/bin/bash
echo "Starting Docker Compose..."
docker compose up -d
echo "Sharding-Server is running on http://localhost"
echo "For the POST route, sending a query of a URL will give you a short URL in response."
echo "Putting the short URL back as a GET request will give you back the original URL."
echo "You can add your servers to see sharding by going to http://localhost:5050/login"
echo "Where login email is postgres@gmail.com and password is postgres."
