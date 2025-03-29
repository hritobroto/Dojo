# Makefile for Dojo project

# Variables
JAR_FILE = target/Dojo-1.0-SNAPSHOT-jar-with-dependencies.jar
PUBLIC_DIR = src/main/resources/public

# Default target
all: build

# Build the frontend (TypeScript)
build-ui:
	@echo "Building frontend..."
	( cd $(PUBLIC_DIR) && npm install && npm run build )

# Build the backend (Maven)
build-app:
	@echo "Building backend..."
	mvn clean package

# Full build (frontend + backend)
build: build-ui build-app

# Run the application
run: build
	@echo "Running Dojo..."
	java -jar $(JAR_FILE)

# Clean the project
clean:
	@echo "Cleaning..."
	mvn clean
	rm -rf $(PUBLIC_DIR)/node_modules $(PUBLIC_DIR)/app.js

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd $(PUBLIC_DIR) && npm install

.PHONY: all build build-ui build-app run clean install