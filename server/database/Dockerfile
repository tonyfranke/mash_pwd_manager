# Derived from official mysql image (our base image)
FROM mysql:5.7.24

# Add a database
ENV MYSQL_DATABASE pwd_manager_db

# Add the content of the sql/ directory to your image
# All scripts in docker-entrypoint-initdb.d/ are automatically
# executed during container startup
COPY ./create.sql /docker-entrypoint-initdb.d/