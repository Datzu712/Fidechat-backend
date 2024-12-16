FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
COPY .env ./.env

# No es necesario empaquetar la aplicación
# RUN mvn clean package -DskipTests

# Usar spring-boot:run para ejecutar la aplicación
CMD ["mvn", "spring-boot:run"]