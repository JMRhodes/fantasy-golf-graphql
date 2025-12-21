# Use the official MongoDB image as a base
FROM mongo:8

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=fantasygolf \
    MONGO_INITDB_ROOT_PASSWORD=fantasygolf \
    MONGO_INITDB_DATABASE=fantasygolf

# Expose default MongoDB port
EXPOSE 27017

# Default CMD from the base image starts mongod
