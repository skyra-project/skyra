FROM postgres:12

WORKDIR /opt/Postgres

# Copy the configuration file
COPY configuration.conf /etc/postgresql/postgresql.conf

# Expose the PostgreSQL port
EXPOSE 5432

# Add VOLUMEs to allow backup of config, logs and databases
VOLUME ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]

# Set the default command to run when starting the container
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
