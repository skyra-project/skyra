FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env

COPY --from=ghcr.io/skyra-project/grpc-protofiles:latest . .

WORKDIR /skyra/app

COPY . ./
RUN dotnet publish Skyra.Grpc -r linux-x64 -p:PublishSingleFile=true -p:PublishTrimmed=true -p:DebugType=None --self-contained true -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:5.0

WORKDIR /skyra/app

COPY --from=build-env /skyra/app/out .

EXPOSE 80

ENTRYPOINT ["/skyra/app/Skyra.Grpc"]
