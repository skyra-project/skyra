# Postgres 12 Docker Image

This is required for the database, you may run Postgres the way you like, but for minimal set-up with PostgreSQL, I
provide this folder.

# Set-Up

Copy and paste the [`configuration.example.conf`] file and rename it to `configuration.conf`, then fill it
with the precise variables.

[`configuration.example.conf`]: /docker/postgres/configuration.example.conf

## Running

```bash
# Build the image
$ docker build -t postgres .

# Run the image
$ docker run --name=postgres -v -d -p 5432:5432 postgres
```
