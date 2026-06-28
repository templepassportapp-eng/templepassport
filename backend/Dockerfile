FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# JVM tuning for e2-micro (1 vCPU, 1 GB RAM shared with postgres + nginx)
# UseContainerSupport reads cgroup limits; MaxRAMPercentage caps heap at 60% of
# whatever memory limit the container has. urandom avoids blocking on /dev/random.
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=60.0", \
  "-XX:InitialRAMPercentage=30.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
