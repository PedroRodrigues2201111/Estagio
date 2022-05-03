#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["ConServAs/ConServAs.csproj", "ConServAs/"]
RUN dotnet restore "ConServAs/ConServAs.csproj"
COPY . .
WORKDIR "/src/ConServAs"
RUN dotnet build "ConServAs.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ConServAs.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ConServAs.dll"]