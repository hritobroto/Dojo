package com.dojo.model;

public class Task {
    private String id;
    private String title;
    private boolean completed;
    private int order;
    private String category;

    public Task() {}

    public Task(String id, String title, boolean completed, int order, String category) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        this.order = order;
        this.category = category;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}