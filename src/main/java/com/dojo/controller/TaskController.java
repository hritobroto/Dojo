package com.dojo.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.dojo.model.Task;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.javalin.http.Context;

public class TaskController {
    private static List<Task> tasks = new ArrayList<>();
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void getAllTasks(Context ctx) {
        ctx.json(tasks);
    }

    public static void createTask(Context ctx) {
        try {
            Task task = mapper.readValue(ctx.body(), Task.class);
            task.setId(UUID.randomUUID().toString());
            task.setOrder(tasks.size());
            tasks.add(task);
            ctx.json(task).status(201);
        } catch (Exception e) {
            ctx.status(400).result("Invalid task data");
        }
    }

    public static void updateTask(Context ctx) {
        String id = ctx.pathParam("id");
        try {
            Task updatedTask = mapper.readValue(ctx.body(), Task.class);
            tasks.stream()
                .filter(task -> task.getId().equals(id))
                .findFirst()
                .ifPresent(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setCompleted(updatedTask.isCompleted());
                    task.setOrder(updatedTask.getOrder());
                    task.setCategory(updatedTask.getCategory());
                });
            ctx.status(204);
        } catch (Exception e) {
            ctx.status(400).result("Invalid task data");
        }
    }

    public static void deleteTask(Context ctx) {
        String id = ctx.pathParam("id");
        tasks.removeIf(task -> task.getId().equals(id));
        ctx.status(204);
    }

    public static void reorderTasks(Context ctx) {
        try {
            List<Task> reorderedTasks = mapper.readValue(ctx.body(), 
                mapper.getTypeFactory().constructCollectionType(List.class, Task.class));
            tasks.clear();
            tasks.addAll(reorderedTasks);
            ctx.status(204);
        } catch (Exception e) {
            ctx.status(400).result("Invalid task list data");
        }
    }
}