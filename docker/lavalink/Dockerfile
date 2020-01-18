FROM adoptopenjdk/openjdk13-openj9:alpine-jre

WORKDIR /opt/Lavalink

COPY Lavalink.jar Lavalink.jar
COPY application.yml application.yml

EXPOSE 2333

CMD ["java", "-jar", "Lavalink.jar"]
