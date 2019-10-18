# Lavalink Docker Image

This is required for voice, and since setting up a docker image like Lavalink with Kitematic is a pain, mostly due to
this application being a complete joke of an application, I have created this folder for ease of development.

# Set-Up

You may download the `Lavalink.jar` file from either [releases](https://github.com/Frederikam/Lavalink/releases) or from
the [CI server](https://ci.fredboat.com/project.html?projectId=Lavalink).

After it is done, copy and paste the [`application.example.yml`] file and rename it to `application.yml`, then fill it
with the precise variables.

[`application.example.yml`]: /docker/lavalink/application.example.yml

## Running

```bash
# Build the image
$ docker build -t lavalink .

# Run the image
$ docker run --name=lavalink -d -p 2333:2333 lavalink
```
