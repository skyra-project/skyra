FROM postgres:12

WORKDIR /opt/Postgres

# Copy the configuration file
COPY configuration.conf /etc/postgresql/postgresql.conf

# Set the default command to run when starting the container
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
