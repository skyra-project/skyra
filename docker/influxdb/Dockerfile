FROM influxdb:latest

WORKDIR /opt/InfluxDB

# Copy the configuration file
COPY config.toml /etc/influxdb/influxdb.toml

ENV INFLUXDB_CONFIG_PATH=/etc/influxdb/influxdb.toml

# Set the default command to run when starting the container
CMD ["influxd"]
