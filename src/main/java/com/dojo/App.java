package com.dojo;

import com.dojo.controller.TaskController;

import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;

public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create(config -> {
        config.staticFiles.add("/public");
        config.jsonMapper(new JavalinJackson());
    }).start(8080);

        // Alternative syntax without routes DSL
        app.get("/api/tasks", TaskController::getAllTasks);
        app.post("/api/tasks", TaskController::createTask);
        app.put("/api/tasks/reorder", TaskController::reorderTasks);
        app.put("/api/tasks/{id}", TaskController::updateTask);
        app.delete("/api/tasks/{id}", TaskController::deleteTask);
    }
}