package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/db"
	"google.golang.org/api/option"
)

var client *db.Client

// 🔥 Initialize Firebase using environment variable
func initFirebase() {
	ctx := context.Background()

	creds := os.Getenv("FIREBASE_CREDENTIALS")
	if creds == "" {
		log.Fatal("FIREBASE_CREDENTIALS environment variable not set")
	}

	opt := option.WithCredentialsJSON([]byte(creds))

	conf := &firebase.Config{
		DatabaseURL: "https://abcd-20e0c-default-rtdb.firebaseio.com/", // Replace with your DB URL
	}

	app, err := firebase.NewApp(ctx, conf, opt)
	if err != nil {
		log.Fatal("Firebase init error:", err)
	}

	client, err = app.Database(ctx)
	if err != nil {
		log.Fatal("Database connection error:", err)
	}
}

// ✅ Enable CORS
func enableCors(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
}

// ➕ Add Task
func addTask(w http.ResponseWriter, r *http.Request) {
	enableCors(w, r)

	if r.Method == "OPTIONS" {
		return
	}

	var data map[string]string
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	ref := client.NewRef("tasks")
	_, err = ref.Push(context.Background(), data)
	if err != nil {
		http.Error(w, "Failed to add task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Task added successfully",
	})
}

// 📥 Get Tasks
func getTasks(w http.ResponseWriter, r *http.Request) {
	enableCors(w, r)

	var tasks map[string]interface{}
	ref := client.NewRef("tasks")
	err := ref.Get(context.Background(), &tasks)
	if err != nil {
		http.Error(w, "Failed to fetch tasks", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(tasks)
}

// ❌ Delete Task
func deleteTask(w http.ResponseWriter, r *http.Request) {
	enableCors(w, r)

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Task ID required", http.StatusBadRequest)
		return
	}

	ref := client.NewRef("tasks/" + id)
	err := ref.Delete(context.Background())
	if err != nil {
		http.Error(w, "Failed to delete task", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Task deleted",
	})
}

// ▶️ MAIN
func main() {
	initFirebase()

	http.HandleFunc("/tasks", getTasks)
	http.HandleFunc("/add", addTask)
	http.HandleFunc("/delete", deleteTask)

	log.Println("✅ Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
