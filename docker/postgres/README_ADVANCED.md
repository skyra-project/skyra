# Postgres 12 Docker Image

## Set-Up

Copy and paste the [`configuration.example.conf`] file and rename it to `configuration.conf`, then fill it
with the precise variables.

[`configuration.example.conf`]: /docker/postgres/configuration.example.conf

## Running

```bash
# Build the image, you do this only once:
$ docker build -t postgres .

# Run the image:
$ docker run postgres
```
