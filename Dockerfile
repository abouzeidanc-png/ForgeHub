# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ForgeHub.API/ForgeHub.API.csproj ForgeHub.API/
RUN dotnet restore ForgeHub.API/ForgeHub.API.csproj

COPY . .
RUN dotnet publish ForgeHub.API/ForgeHub.API.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "ForgeHub.API.dll"]